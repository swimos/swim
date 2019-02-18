// Copyright 2015-2019 SWIM.AI inc.
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
  public <T> Writer<?, HttpRequest<T>> requestWriter(HttpRequest<T> request) {
    return new HttpRequestWriter<T>(this, request);
  }

  public <T> Writer<?, HttpRequest<T>> writeRequest(HttpRequest<T> request, Output<?> output) {
    return HttpRequestWriter.write(output, this, request);
  }

  public <T> Writer<?, HttpResponse<T>> responseWriter(HttpResponse<T> response) {
    return new HttpResponseWriter<T>(this, response);
  }

  public <T> Writer<?, HttpResponse<T>> writeResponse(HttpResponse<T> response, Output<?> output) {
    return HttpResponseWriter.write(output, this, response);
  }

  public Writer<?, ?> methodWriter(String name) {
    return new TokenWriter(name);
  }

  public Writer<?, ?> writeMethod(String name, Output<?> output) {
    return TokenWriter.write(output, name);
  }

  public Writer<?, ?> statusWriter(int code, String phrase) {
    return new HttpStatusWriter(this, code, phrase);
  }

  public Writer<?, ?> writeStatus(int code, String phrase, Output<?> output) {
    return HttpStatusWriter.write(output, this, code, phrase);
  }

  public Writer<?, ?> versionWriter(int major, int minor) {
    return new HttpVersionWriter(major, minor);
  }

  public Writer<?, ?> writeVersion(int major, int minor, Output<?> output) {
    return HttpVersionWriter.write(output, major, minor);
  }

  public Writer<?, ?> headerWriter(HttpHeader header) {
    return new HttpHeaderWriter(this, header);
  }

  public Writer<?, ?> writeHeader(HttpHeader header, Output<?> output) {
    return HttpHeaderWriter.write(output, this, header);
  }

  public Writer<?, ?> writeHeaderValue(HttpHeader header, Output<?> output) {
    return header.writeHttpValue(output, this);
  }

  public Writer<?, ?> chunkHeaderWriter(long size, Iterator<ChunkExtension> extensions) {
    return new HttpChunkHeaderWriter(this, size, extensions);
  }

  public Writer<?, ?> writeChunkHeader(long size, Iterator<ChunkExtension> extensions, Output<?> output) {
    return HttpChunkHeaderWriter.write(output, this, size, extensions);
  }

  public Writer<?, ?> chunkTrailerWriter(Iterator<HttpHeader> headers) {
    return new HttpChunkTrailerWriter(this, headers);
  }

  public Writer<?, ?> writeChunkTrailer(Iterator<HttpHeader> headers, Output<?> output) {
    return HttpChunkTrailerWriter.write(output, this, headers);
  }

  public Writer<?, ?> chunkExtensionWriter(String name, String value) {
    return new ParamWriter(this, name, value);
  }

  public Writer<?, ?> writeChunkExtension(String name, String value, Output<?> output) {
    return ParamWriter.write(output, this, name, value);
  }

  public Writer<?, ?> charsetWriter(String name, float weight) {
    if (weight == 1f) {
      return new TokenWriter(name);
    } else {
      return new HttpCharsetWriter(this, name, weight);
    }
  }

  public Writer<?, ?> writeCharset(String name, float weight, Output<?> output) {
    if (weight == 1f) {
      return TokenWriter.write(output, name);
    } else {
      return HttpCharsetWriter.write(output, this, name, weight);
    }
  }

  public Writer<?, ?> languageRangeWriter(String tag, String subtag, float weight) {
    return new LanguageRangeWriter(this, tag, subtag, weight);
  }

  public Writer<?, ?> writeLanguageRange(String tag, String subtag, float weight, Output<?> output) {
    return LanguageRangeWriter.write(output, this, tag, subtag, weight);
  }

  public Writer<?, ?> mediaRangeWriter(String type, String subtype, float weight, HashTrieMap<String, String> params) {
    return new MediaRangeWriter(this, type, subtype, weight, params);
  }

  public Writer<?, ?> writeMediaRange(String type, String subtype, float weight, HashTrieMap<String, String> params, Output<?> output) {
    return MediaRangeWriter.write(output, this, type, subtype, weight, params);
  }

  public Writer<?, ?> mediaTypeWriter(String type, String subtype, HashTrieMap<String, String> params) {
    return new MediaTypeWriter(this, type, subtype, params);
  }

  public Writer<?, ?> writeMediaType(String type, String subtype, HashTrieMap<String, String> params, Output<?> output) {
    return MediaTypeWriter.write(output, this, type, subtype, params);
  }

  public Writer<?, ?> productWriter(String name, String version, Iterator<String> comments) {
    return new ProductWriter(this, name, version, comments);
  }

  public Writer<?, ?> writeProduct(String name, String version, Iterator<String> comments, Output<?> output) {
    return ProductWriter.write(output, this, name, version, comments);
  }

  public Writer<?, ?> upgradeProtocolWriter(String name, String version) {
    return new UpgradeProtocolWriter(this, name, version);
  }

  public Writer<?, ?> writeUpgradeProtocol(String name, String version, Output<?> output) {
    return UpgradeProtocolWriter.write(output, this, name, version);
  }

  public Writer<?, ?> contentCodingWriter(String name, float weight) {
    if (weight == 1f) {
      return new TokenWriter(name);
    } else {
      return new ContentCodingWriter(this, name, weight);
    }
  }

  public Writer<?, ?> writeContentCoding(String name, float weight, Output<?> output) {
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

  public Writer<?, ?> writeTransferCoding(String name, HashTrieMap<String, String> params, Output<?> output) {
    if (params.isEmpty()) {
      return TokenWriter.write(output, name);
    } else {
      return TransferCodingWriter.write(output, this, name, params);
    }
  }

  public Writer<?, ?> webSocketParamWriter(String key, String value) {
    return new ParamWriter(this, key, value);
  }

  public Writer<?, ?> writeWebSocketParam(String key, String value, Output<?> output) {
    return ParamWriter.write(output, this, key, value);
  }

  public Writer<?, ?> webSocketExtensionWriter(String name, Iterator<WebSocketParam> params) {
    return new WebSocketExtensionWriter(this, name, params);
  }

  public Writer<?, ?> writeWebSocketExtension(String name, Iterator<WebSocketParam> params, Output<?> output) {
    return WebSocketExtensionWriter.write(output, this, name, params);
  }

  public Writer<?, ?> writeValue(String value, Output<?> output) {
    if (Http.isToken(value)) {
      return writeToken(value, output);
    } else {
      return writeQuoted(value, output);
    }
  }

  public Writer<?, ?> writeToken(String token, Output<?> output) {
    return TokenWriter.write(output, token);
  }

  public Writer<?, ?> writeQuoted(String quoted, Output<?> output) {
    return QuotedWriter.write(output, quoted);
  }

  public Writer<?, ?> writePhrase(String phrase, Output<?> output) {
    return PhraseWriter.write(output, phrase);
  }

  public Writer<?, ?> writeField(String field, Output<?> output) {
    return FieldWriter.write(output, field);
  }

  public Writer<?, ?> writeQValue(float weight, Output<?> output) {
    return QValueWriter.write(output, weight);
  }

  public Writer<?, ?> writeComments(Iterator<String> comments, Output<?> output) {
    return CommentsWriter.write(output, comments);
  }

  public Writer<?, ?> writeTokenList(Iterator<?> tokens, Output<?> output) {
    return TokenListWriter.write(output, tokens);
  }

  public Writer<?, ?> writeParam(String key, String value, Output<?> output) {
    return ParamWriter.write(output, this, key, value);
  }

  public Writer<?, ?> writeParamList(Iterator<? extends HttpPart> params, Output<?> output) {
    return ParamListWriter.write(output, this, params);
  }

  public Writer<?, ?> writeParamMap(Iterator<? extends Map.Entry<?, ?>> params, Output<?> output) {
    return ParamMapWriter.write(output, this, params);
  }

  public <T2> Encoder<?, HttpMessage<T2>> bodyEncoder(HttpMessage<T2> message,
                                                      Encoder<?, ?> content, long length) {
    return new HttpBodyEncoder<T2>(message, content, length);
  }

  public <T2> Encoder<?, HttpMessage<T2>> encodeBody(HttpMessage<T2> message,
                                                     Encoder<?, ?> content, long length,
                                                     OutputBuffer<?> output) {
    return HttpBodyEncoder.encode(output, message, content, length);
  }

  public <T2> Encoder<?, HttpMessage<T2>> chunkedEncoder(HttpMessage<T2> message, Encoder<?, ?> content) {
    return new HttpChunkedEncoder<T2>(message, content);
  }

  public <T2> Encoder<?, HttpMessage<T2>> encodeChunked(HttpMessage<T2> message, Encoder<?, ?> content,
                                                        OutputBuffer<?> output) {
    return HttpChunkedEncoder.encode(output, message, content);
  }
}
