// Copyright 2015-2023 Swim.inc
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

import java.util.Iterator;
import java.util.Map;
import swim.codec.Encoder;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.codec.Writer;
import swim.collections.HashTrieMap;

public class HttpWriter {

  public HttpWriter() {
    // nop
  }

  public <T> Writer<?, HttpRequest<T>> requestWriter(HttpRequest<T> request) {
    return new HttpRequestWriter<T>(this, request);
  }

  public <T> Writer<?, HttpRequest<T>> writeRequest(Output<?> output, HttpRequest<T> request) {
    return HttpRequestWriter.write(output, this, request);
  }

  public <T> Writer<?, HttpResponse<T>> responseWriter(HttpResponse<T> response) {
    return new HttpResponseWriter<T>(this, response);
  }

  public <T> Writer<?, HttpResponse<T>> writeResponse(Output<?> output, HttpResponse<T> response) {
    return HttpResponseWriter.write(output, this, response);
  }

  public Writer<?, ?> methodWriter(String name) {
    return new TokenWriter(name);
  }

  public Writer<?, ?> writeMethod(Output<?> output, String name) {
    return TokenWriter.write(output, name);
  }

  public Writer<?, ?> statusWriter(int code, String phrase) {
    return new HttpStatusWriter(this, code, phrase);
  }

  public Writer<?, ?> writeStatus(Output<?> output, int code, String phrase) {
    return HttpStatusWriter.write(output, this, code, phrase);
  }

  public Writer<?, ?> versionWriter(int major, int minor) {
    return new HttpVersionWriter(major, minor);
  }

  public Writer<?, ?> writeVersion(Output<?> output, int major, int minor) {
    return HttpVersionWriter.write(output, major, minor);
  }

  public Writer<?, ?> headerWriter(HttpHeader header) {
    return new HttpHeaderWriter(this, header);
  }

  public Writer<?, ?> writeHeader(Output<?> output, HttpHeader header) {
    return HttpHeaderWriter.write(output, this, header);
  }

  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpHeader header) {
    return header.writeHeaderValue(output, this);
  }

  public Writer<?, ?> chunkHeaderWriter(long size, Iterator<ChunkExtension> extensions) {
    return new HttpChunkHeaderWriter(this, size, extensions);
  }

  public Writer<?, ?> writeChunkHeader(Output<?> output, long size, Iterator<ChunkExtension> extensions) {
    return HttpChunkHeaderWriter.write(output, this, size, extensions);
  }

  public Writer<?, ?> chunkTrailerWriter(Iterator<HttpHeader> headers) {
    return new HttpChunkTrailerWriter(this, headers);
  }

  public Writer<?, ?> writeChunkTrailer(Output<?> output, Iterator<HttpHeader> headers) {
    return HttpChunkTrailerWriter.write(output, this, headers);
  }

  public Writer<?, ?> chunkExtensionWriter(String name, String value) {
    return new ParamWriter(this, name, value);
  }

  public Writer<?, ?> writeChunkExtension(Output<?> output, String name, String value) {
    return ParamWriter.write(output, this, name, value);
  }

  public Writer<?, ?> charsetWriter(String name, float weight) {
    if (weight == 1f) {
      return new TokenWriter(name);
    } else {
      return new HttpCharsetWriter(this, name, weight);
    }
  }

  public Writer<?, ?> writeCharset(Output<?> output, String name, float weight) {
    if (weight == 1f) {
      return TokenWriter.write(output, name);
    } else {
      return HttpCharsetWriter.write(output, this, name, weight);
    }
  }

  public Writer<?, ?> languageRangeWriter(String tag, String subtag, float weight) {
    return new LanguageRangeWriter(this, tag, subtag, weight);
  }

  public Writer<?, ?> writeLanguageRange(Output<?> output, String tag, String subtag, float weight) {
    return LanguageRangeWriter.write(output, this, tag, subtag, weight);
  }

  public Writer<?, ?> mediaRangeWriter(String type, String subtype, float weight, HashTrieMap<String, String> params) {
    return new MediaRangeWriter(this, type, subtype, weight, params);
  }

  public Writer<?, ?> writeMediaRange(Output<?> output, String type, String subtype, float weight, HashTrieMap<String, String> params) {
    return MediaRangeWriter.write(output, this, type, subtype, weight, params);
  }

  public Writer<?, ?> mediaTypeWriter(String type, String subtype, HashTrieMap<String, String> params) {
    return new MediaTypeWriter(this, type, subtype, params);
  }

  public Writer<?, ?> writeMediaType(Output<?> output, String type, String subtype, HashTrieMap<String, String> params) {
    return MediaTypeWriter.write(output, this, type, subtype, params);
  }

  public Writer<?, ?> productWriter(String name, String version, Iterator<String> comments) {
    return new ProductWriter(this, name, version, comments);
  }

  public Writer<?, ?> writeProduct(Output<?> output, String name, String version, Iterator<String> comments) {
    return ProductWriter.write(output, this, name, version, comments);
  }

  public Writer<?, ?> upgradeProtocolWriter(String name, String version) {
    return new UpgradeProtocolWriter(this, name, version);
  }

  public Writer<?, ?> writeUpgradeProtocol(Output<?> output, String name, String version) {
    return UpgradeProtocolWriter.write(output, this, name, version);
  }

  public Writer<?, ?> contentCodingWriter(String name, float weight) {
    if (weight == 1f) {
      return new TokenWriter(name);
    } else {
      return new ContentCodingWriter(this, name, weight);
    }
  }

  public Writer<?, ?> writeContentCoding(Output<?> output, String name, float weight) {
    if (weight == 1f) {
      return TokenWriter.write(output, name);
    } else {
      return ContentCodingWriter.write(output, this, name, weight);
    }
  }

  public Writer<?, ?> transferCodingWriter(String name, HashTrieMap<String, String> params) {
    if (params.isEmpty()) {
      return new TokenWriter(name);
    } else {
      return new TransferCodingWriter(this, name, params);
    }
  }

  public Writer<?, ?> writeTransferCoding(Output<?> output, String name, HashTrieMap<String, String> params) {
    if (params.isEmpty()) {
      return TokenWriter.write(output, name);
    } else {
      return TransferCodingWriter.write(output, this, name, params);
    }
  }

  public Writer<?, ?> webSocketParamWriter(String key, String value) {
    return new ParamWriter(this, key, value);
  }

  public Writer<?, ?> writeWebSocketParam(Output<?> output, String key, String value) {
    return ParamWriter.write(output, this, key, value);
  }

  public Writer<?, ?> webSocketExtensionWriter(String name, Iterator<WebSocketParam> params) {
    return new WebSocketExtensionWriter(this, name, params);
  }

  public Writer<?, ?> writeWebSocketExtension(Output<?> output, String name, Iterator<WebSocketParam> params) {
    return WebSocketExtensionWriter.write(output, this, name, params);
  }

  public Writer<?, ?> writeValue(Output<?> output, String value) {
    if (Http.isToken(value)) {
      return this.writeToken(output, value);
    } else {
      return this.writeQuoted(output, value);
    }
  }

  public Writer<?, ?> writeToken(Output<?> output, String token) {
    return TokenWriter.write(output, token);
  }

  public Writer<?, ?> writeQuoted(Output<?> output, String quoted) {
    return QuotedWriter.write(output, quoted);
  }

  public Writer<?, ?> writePhrase(Output<?> output, String phrase) {
    return PhraseWriter.write(output, phrase);
  }

  public Writer<?, ?> writeField(Output<?> output, String field) {
    return FieldWriter.write(output, field);
  }

  public Writer<?, ?> writeQValue(Output<?> output, float weight) {
    return QValueWriter.write(output, weight);
  }

  public Writer<?, ?> writeComments(Output<?> output, Iterator<String> comments) {
    return CommentsWriter.write(output, comments);
  }

  public Writer<?, ?> writeTokenList(Output<?> output, Iterator<?> tokens) {
    return TokenListWriter.write(output, tokens);
  }

  public Writer<?, ?> writeParam(Output<?> output, String key, String value) {
    return ParamWriter.write(output, this, key, value);
  }

  public Writer<?, ?> writeParamList(Output<?> output, Iterator<? extends HttpPart> params) {
    return ParamListWriter.write(output, this, params, ',');
  }

  public Writer<?, ?> writeParamListWithSeparator(Output<?> output, Iterator<? extends HttpPart> params, char separator) {
    return ParamListWriter.write(output, this, params, separator);
  }

  public Writer<?, ?> writeParamMap(Output<?> output, Iterator<? extends Map.Entry<?, ?>> params) {
    return ParamMapWriter.write(output, this, params);
  }

  public <T2> Encoder<?, HttpMessage<T2>> bodyEncoder(HttpMessage<T2> message,
                                                      Encoder<?, ?> payloadEncoder, long contentLength) {
    return new HttpBodyEncoder<T2>(message, payloadEncoder, contentLength);
  }

  public <T2> Encoder<?, HttpMessage<T2>> encodeBody(OutputBuffer<?> output, HttpMessage<T2> message,
                                                     Encoder<?, ?> payloadEncoder, long contentLength) {
    return HttpBodyEncoder.encode(output, message, payloadEncoder, contentLength);
  }

  public <T2> Encoder<?, HttpMessage<T2>> chunkedEncoder(HttpMessage<T2> message, Encoder<?, ?> payloadEncoder) {
    return new HttpChunkedEncoder<T2>(message, payloadEncoder);
  }

  public <T2> Encoder<?, HttpMessage<T2>> encodeChunked(OutputBuffer<?> output, HttpMessage<T2> message,
                                                        Encoder<?, ?> payloadEncoder) {
    return HttpChunkedEncoder.encode(output, message, payloadEncoder);
  }

}
