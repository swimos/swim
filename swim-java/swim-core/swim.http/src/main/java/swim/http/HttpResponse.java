// Copyright 2015-2023 Nstream, inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package swim.http;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Binary;
import swim.codec.BinaryInputBuffer;
import swim.codec.Codec;
import swim.codec.CodecException;
import swim.codec.Decode;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.InputBuffer;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Text;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.collections.FingerTrieList;
import swim.http.header.ContentLengthHeader;
import swim.http.header.ContentTypeHeader;
import swim.http.header.TransferEncodingHeader;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;

@Public
@Since("5.0")
public final class HttpResponse<T> extends HttpMessage<T> {

  final HttpVersion version;
  final HttpStatus status;
  final HttpHeaders headers;
  final HttpPayload<T> payload;

  HttpResponse(HttpVersion version, HttpStatus status,
               HttpHeaders headers, HttpPayload<T> payload) {
    this.version = version;
    this.status = status;
    this.headers = headers;
    this.payload = payload;
  }

  @Override
  public HttpVersion version() {
    return this.version;
  }

  public HttpResponse<T> withVersion(HttpVersion version) {
    return HttpResponse.of(version, this.status, this.headers, this.payload);
  }

  public HttpStatus status() {
    return this.status;
  }

  public HttpResponse<T> withStatus(HttpStatus status) {
    return HttpResponse.of(this.version, status, this.headers, this.payload);
  }

  @Override
  public HttpHeaders headers() {
    return this.headers;
  }

  @Override
  public HttpResponse<T> withHeaders(HttpHeaders headers) {
    return HttpResponse.of(this.version, this.status, headers, this.payload);
  }

  @Override
  public HttpResponse<T> withHeaders(HttpHeader... headers) {
    return this.withHeaders(HttpHeaders.of(headers));
  }

  @Override
  public HttpPayload<T> payload() {
    return this.payload;
  }

  @Override
  public <T2> HttpResponse<T2> withPayload(HttpPayload<T2> payload) {
    return HttpResponse.of(this.version, this.status, this.headers, payload);
  }

  public <T2> Decode<? extends HttpPayload<T2>> decodePayload(InputBuffer input, HttpRequest<?> request, Codec<T2> codec) throws HttpException {
    // RFC 7230 § 3.3.3 Item 1
    if (request.method().equals(HttpMethod.HEAD)
        || this.status().isInformational()
        || this.status().code() == HttpStatus.NO_CONTENT.code()
        || this.status().code() == HttpStatus.NOT_MODIFIED.code()) {
      return HttpEmpty.decode(input);
    }

    // RFC 7230 § 3.3.3 Item 2
    if (request.method().equals(HttpMethod.CONNECT)
        && this.status().isSuccessful()) {
      return HttpEmpty.decode(input);
    }

    final HttpHeaders headers = this.headers();
    ContentLengthHeader contentLength = null;
    TransferEncodingHeader transferEncoding = null;
    for (int i = 0, n = headers.size(); i < n; i += 1) {
      final HttpHeader header = headers.get(i);
      if (header instanceof ContentLengthHeader) {
        if (contentLength != null) {
          // RFC 7230 § 3.3.3 Item 4
          throw new HttpException(HttpStatus.BAD_GATEWAY, "conflicting Content-Length");
        }
        contentLength = (ContentLengthHeader) header;
      } else if (header instanceof TransferEncodingHeader) {
        transferEncoding = (TransferEncodingHeader) header;
      }
    }

    if (transferEncoding != null) {
      // RFC 7230 § 3.3.3 Item 3
      final FingerTrieList<HttpTransferCoding> transferCodings = transferEncoding.codings();
      if (transferCodings.size() != 1 || !Assume.nonNull(transferCodings.head()).isChunked()) {
        throw new HttpException(HttpStatus.BAD_GATEWAY, "unsupported Transfer-Encoding: " + transferEncoding.value());
      }
      return HttpChunked.decode(input, codec);
    }

    if (contentLength != null) {
      // RFC 7230 § 3.3.3 Item 5
      return HttpBody.decode(input, codec, contentLength.length());
    }

    // RFC 7230 § 3.3.3 Item 7
    return HttpUnsized.decode(input, codec);
  }

  public <T2> Decode<? extends HttpPayload<T2>> decodePayload(InputBuffer input, HttpRequest<?> request) throws HttpException {
    // RFC 7230 § 3.3.3 Item 1
    if (request.method().equals(HttpMethod.HEAD)
        || this.status().isInformational()
        || this.status().code() == HttpStatus.NO_CONTENT.code()
        || this.status().code() == HttpStatus.NOT_MODIFIED.code()) {
      return HttpEmpty.decode(input);
    }

    // RFC 7230 § 3.3.3 Item 2
    if (request.method().equals(HttpMethod.CONNECT)
        && this.status().isSuccessful()) {
      return HttpEmpty.decode(input);
    }

    final HttpHeaders headers = this.headers();
    ContentTypeHeader contentType = null;
    ContentLengthHeader contentLength = null;
    TransferEncodingHeader transferEncoding = null;
    for (int i = 0, n = headers.size(); i < n; i += 1) {
      final HttpHeader header = headers.get(i);
      if (header instanceof ContentTypeHeader) {
        contentType = (ContentTypeHeader) header;
      } else if (header instanceof ContentLengthHeader) {
        if (contentLength != null) {
          // RFC 7230 § 3.3.3 Item 4
          throw new HttpException(HttpStatus.BAD_GATEWAY, "conflicting Content-Length");
        }
        contentLength = (ContentLengthHeader) header;
      } else if (header instanceof TransferEncodingHeader) {
        transferEncoding = (TransferEncodingHeader) header;
      }
    }

    Codec<T2> codec;
    if (contentType != null) {
      try {
        codec = Codec.get(contentType.mediaType(), Object.class);
      } catch (CodecException cause) {
        codec = Assume.conforms(Binary.byteBufferCodec());
      }
    } else {
      codec = Assume.conforms(Binary.byteBufferCodec());
    }

    if (transferEncoding != null) {
      // RFC 7230 § 3.3.3 Item 3
      final FingerTrieList<HttpTransferCoding> transferCodings = transferEncoding.codings();
      if (transferCodings.size() != 1 || !Assume.nonNull(transferCodings.head()).isChunked()) {
        throw new HttpException(HttpStatus.BAD_GATEWAY, "unsupported Transfer-Encoding: " + transferEncoding.value());
      }
      return HttpChunked.decode(input, codec);
    }

    if (contentLength != null) {
      // RFC 7230 § 3.3.3 Item 5
      return HttpBody.decode(input, codec, contentLength.length());
    }

    // RFC 7230 § 3.3.3 Item 7
    return HttpUnsized.decode(input, codec);
  }

  public <T2> Decode<? extends HttpPayload<T2>> decodePayload(HttpRequest<?> request, Codec<T2> codec) throws HttpException {
    return this.decodePayload(BinaryInputBuffer.empty(), request, codec);
  }

  public <T2> Decode<? extends HttpPayload<T2>> decodePayload(HttpRequest<?> request) throws HttpException {
    return this.decodePayload(BinaryInputBuffer.empty(), request);
  }

  @Override
  public Write<HttpResponse<T>> write(Output<?> output) {
    return WriteHttpResponse.write(output, this, null, 1);
  }

  @Override
  public Write<HttpResponse<T>> write() {
    return new WriteHttpResponse<T>(this, null, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpResponse<?> that) {
      return this.version.equals(that.version)
          && this.status.equals(that.status)
          && this.headers.equals(that.headers)
          && this.payload.equals(that.payload);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpResponse.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        HASH_SEED, this.version.hashCode()), this.status.hashCode()),
        this.headers.hashCode()), this.payload.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpResponse", "of")
            .appendArgument(this.version)
            .appendArgument(this.status);
    for (HttpHeader header : this.headers) {
      notation.appendArgument(header);
    }
    notation.endInvoke();
    if (!(this.payload instanceof HttpEmpty<?>)) {
      notation.beginInvoke("withPayload")
              .appendArgument(this.payload)
              .endInvoke();
    }
  }

  @Override
  public void writeString(Appendable output) {
    this.write(StringOutput.from(output)).assertDone();
  }

  @Override
  public String toString() {
    final StringOutput output = new StringOutput();
    this.write(output).assertDone();
    return output.get();
  }

  public static <T> HttpResponse<T> of(HttpVersion version, HttpStatus status,
                                       HttpHeaders headers, HttpPayload<T> payload) {
    return new HttpResponse<T>(version, status, headers, payload);
  }

  public static <T> HttpResponse<T> of(HttpVersion version, HttpStatus status,
                                       HttpHeaders headers) {
    return new HttpResponse<T>(version, status, headers, HttpEmpty.payload());
  }

  public static <T> HttpResponse<T> of(HttpVersion version, HttpStatus status,
                                       HttpHeader... headers) {
    return new HttpResponse<T>(version, status, HttpHeaders.of(headers), HttpEmpty.payload());
  }

  public static <T> HttpResponse<T> of(HttpVersion version, HttpStatus status) {
    return new HttpResponse<T>(version, status, HttpHeaders.empty(), HttpEmpty.payload());
  }

  public static <T> HttpResponse<T> of(HttpStatus status, HttpHeaders headers,
                                       HttpPayload<T> payload) {
    return new HttpResponse<T>(HttpVersion.HTTP_1_1, status, headers, payload);
  }

  public static <T> HttpResponse<T> of(HttpStatus status, HttpHeaders headers) {
    return new HttpResponse<T>(HttpVersion.HTTP_1_1, status, headers, HttpEmpty.payload());
  }

  public static <T> HttpResponse<T> of(HttpStatus status, HttpHeader... headers) {
    return new HttpResponse<T>(HttpVersion.HTTP_1_1, status,
                               HttpHeaders.of(headers), HttpEmpty.payload());
  }

  public static <T> HttpResponse<T> of(HttpStatus status) {
    return new HttpResponse<T>(HttpVersion.HTTP_1_1, status,
                               HttpHeaders.empty(), HttpEmpty.payload());
  }

  public static HttpResponse<?> error(Throwable error) {
    HttpStatus status = null;
    if (error instanceof HttpException) {
      status = ((HttpException) error).getStatus();
    }
    if (status == null) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    final HttpPayload<?> payload;
    final String message = error.getMessage();
    if (message != null) {
      payload = HttpBody.of(message, Text.stringCodec());
    } else {
      payload = HttpEmpty.payload();
    }

    return HttpResponse.of(status, payload.headers(), payload);
  }

  public static <T> Parse<HttpResponse<T>> parse(Input input, @Nullable HttpHeaderRegistry headerRegistry) {
    return ParseHttpResponse.parse(input, headerRegistry, null, null, null, 1);
  }

  public static <T> Parse<HttpResponse<T>> parse(Input input) {
    return HttpResponse.parse(input, HttpHeader.registry());
  }

  public static <T> Parse<HttpResponse<T>> parse(@Nullable HttpHeaderRegistry headerRegistry) {
    return new ParseHttpResponse<T>(headerRegistry, null, null, null, 1);
  }

  public static <T> Parse<HttpResponse<T>> parse() {
    return HttpResponse.parse(HttpHeader.registry());
  }

  public static <T> Parse<HttpResponse<T>> parse(String string) {
    final StringInput input = new StringInput(string);
    return HttpResponse.<T>parse(input).complete(input);
  }

}

final class ParseHttpResponse<T> extends Parse<HttpResponse<T>> {

  final @Nullable HttpHeaderRegistry headerRegistry;
  final @Nullable Parse<HttpVersion> parseVersion;
  final @Nullable Parse<HttpStatus> parseStatus;
  final @Nullable Parse<HttpHeaders> parseHeaders;
  final int step;

  ParseHttpResponse(@Nullable HttpHeaderRegistry headerRegistry,
                    @Nullable Parse<HttpVersion> parseVersion,
                    @Nullable Parse<HttpStatus> parseStatus,
                    @Nullable Parse<HttpHeaders> parseHeaders, int step) {
    this.headerRegistry = headerRegistry;
    this.parseVersion = parseVersion;
    this.parseStatus = parseStatus;
    this.parseHeaders = parseHeaders;
    this.step = step;
  }

  @Override
  public Parse<HttpResponse<T>> consume(Input input) {
    return ParseHttpResponse.parse(input, this.headerRegistry, this.parseVersion,
                                   this.parseStatus, this.parseHeaders, this.step);
  }

  static <T> Parse<HttpResponse<T>> parse(Input input,
                                          @Nullable HttpHeaderRegistry headerRegistry,
                                          @Nullable Parse<HttpVersion> parseVersion,
                                          @Nullable Parse<HttpStatus> parseStatus,
                                          @Nullable Parse<HttpHeaders> parseHeaders,
                                          int step) {
    if (step == 1) {
      if (parseVersion == null) {
        parseVersion = HttpVersion.parse(input);
      } else {
        parseVersion = parseVersion.consume(input);
      }
      if (parseVersion.isDone()) {
        step = 2;
      } else if (parseVersion.isError()) {
        return parseVersion.asError();
      }
    }
    if (step == 2) {
      if (input.isCont() && input.head() == ' ') {
        input.step();
        step = 3;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("space", input));
      }
    }
    if (step == 3) {
      if (parseStatus == null) {
        parseStatus = HttpStatus.parse(input);
      } else {
        parseStatus = parseStatus.consume(input);
      }
      if (parseStatus.isDone()) {
        step = 4;
      } else if (parseStatus.isError()) {
        return parseStatus.asError();
      }
    }
    if (step == 4) {
      if (input.isCont() && input.head() == '\r') {
        input.step();
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("carriage return", input));
      }
    }
    if (step == 5) {
      if (input.isCont() && input.head() == '\n') {
        input.step();
        step = 6;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("line feed", input));
      }
    }
    if (step == 6) {
      if (parseHeaders == null) {
        parseHeaders = HttpHeaders.parse(input, headerRegistry);
      } else {
        parseHeaders = parseHeaders.consume(input);
      }
      if (parseHeaders.isDone()) {
        step = 7;
      } else if (parseHeaders.isError()) {
        return parseHeaders.asError();
      }
    }
    if (step == 7) {
      if (input.isCont() && input.head() == '\r') {
        input.step();
        step = 8;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("carriage return", input));
      }
    }
    if (step == 8) {
      if (input.isCont() && input.head() == '\n') {
        input.step();
        return Parse.done(HttpResponse.of(Assume.nonNull(parseVersion).getNonNullUnchecked(),
                                          Assume.nonNull(parseStatus).getNonNullUnchecked(),
                                          Assume.nonNull(parseHeaders).getNonNullUnchecked(),
                                          HttpEmpty.payload()));
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("line feed", input));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseHttpResponse<T>(headerRegistry, parseVersion, parseStatus,
                                    parseHeaders, step);
  }

}

final class WriteHttpResponse<T> extends Write<HttpResponse<T>> {

  final HttpResponse<T> response;
  final @Nullable Write<?> write;
  final int step;

  WriteHttpResponse(HttpResponse<T> response, @Nullable Write<?> write, int step) {
    this.response = response;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<HttpResponse<T>> produce(Output<?> output) {
    return WriteHttpResponse.write(output, this.response, this.write, this.step);
  }

  static <T> Write<HttpResponse<T>> write(Output<?> output, HttpResponse<T> response,
                                          @Nullable Write<?> write, int step) {
    if (step == 1) {
      if (write == null) {
        write = response.version().write(output);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 2;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 2 && output.isCont()) {
      output.write(' ');
      step = 3;
    }
    if (step == 3) {
      if (write == null) {
        write = response.status().write(output);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 4;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 4 && output.isCont()) {
      output.write('\r');
      step = 5;
    }
    if (step == 5 && output.isCont()) {
      output.write('\n');
      step = 6;
    }
    if (step == 6) {
      if (write == null) {
        write = response.headers().write(output);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 7;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 7 && output.isCont()) {
      output.write('\r');
      step = 8;
    }
    if (step == 8 && output.isCont()) {
      output.write('\n');
      return Write.done(response);
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteHttpResponse<T>(response, write, step);
  }

}
