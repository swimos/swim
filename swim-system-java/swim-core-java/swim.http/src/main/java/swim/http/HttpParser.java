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

import swim.codec.Decoder;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.InputBuffer;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.http.header.Accept;
import swim.http.header.AcceptCharset;
import swim.http.header.AcceptEncoding;
import swim.http.header.AcceptLanguage;
import swim.http.header.Allow;
import swim.http.header.Connection;
import swim.http.header.ContentEncoding;
import swim.http.header.ContentLength;
import swim.http.header.ContentType;
import swim.http.header.Expect;
import swim.http.header.Host;
import swim.http.header.MaxForwards;
import swim.http.header.Origin;
import swim.http.header.RawHeader;
import swim.http.header.SecWebSocketAccept;
import swim.http.header.SecWebSocketExtensions;
import swim.http.header.SecWebSocketKey;
import swim.http.header.SecWebSocketProtocol;
import swim.http.header.SecWebSocketVersion;
import swim.http.header.Server;
import swim.http.header.TransferEncoding;
import swim.http.header.Upgrade;
import swim.http.header.UserAgent;
import swim.uri.Uri;

public class HttpParser {
  public <T> HttpRequest<T> request(HttpMethod method, Uri uri, HttpVersion version,
                                    FingerTrieSeq<HttpHeader> headers) {
    return HttpRequest.from(method, uri, version, headers);
  }

  public <T> HttpResponse<T> response(HttpVersion version, HttpStatus status,
                                      FingerTrieSeq<HttpHeader> headers) {
    return HttpResponse.from(version, status, headers);
  }

  public HttpMethod method(String name) {
    return HttpMethod.from(name);
  }

  public HttpStatus status(int code, String phrase) {
    return HttpStatus.from(code, phrase);
  }

  public HttpVersion version(int major, int minor) {
    return HttpVersion.from(major, minor);
  }

  public HttpChunkHeader chunkHeader(long size, FingerTrieSeq<ChunkExtension> extensions) {
    return HttpChunkHeader.from(size, extensions);
  }

  public HttpChunkTrailer chunkTrailer(FingerTrieSeq<HttpHeader> headers) {
    return HttpChunkTrailer.from(headers);
  }

  public ChunkExtension chunkExtension(String name, String value) {
    return ChunkExtension.from(name, value);
  }

  public HttpCharset charset(String name, float weight) {
    return HttpCharset.from(name, weight);
  }

  public LanguageRange languageRange(String tag, String subtag, float weight) {
    return LanguageRange.from(tag, subtag, weight);
  }

  public MediaRange mediaRange(String type, String subtype, float weight, HashTrieMap<String, String> params) {
    return MediaRange.from(type, subtype, weight, params);
  }

  public MediaType mediaType(String type, String subtype, HashTrieMap<String, String> params) {
    return MediaType.from(type, subtype, params);
  }

  public Product product(String name, String version, FingerTrieSeq<String> comments) {
    return Product.from(name, version, comments);
  }

  public ContentCoding contentCoding(String name, float weight) {
    return ContentCoding.from(name, weight);
  }

  public TransferCoding transferCoding(String name, HashTrieMap<String, String> params) {
    return TransferCoding.from(name, params);
  }

  public UpgradeProtocol upgradeProtocol(String name, String version) {
    return UpgradeProtocol.from(name, version);
  }

  public WebSocketParam webSocketParam(String key, String value) {
    return WebSocketParam.from(key, value);
  }

  public WebSocketExtension webSocketExtension(String name, FingerTrieSeq<WebSocketParam> params) {
    return WebSocketExtension.from(name, params);
  }

  public <T> Parser<HttpRequest<T>> requestParser() {
    return new HttpRequestParser<T>(this);
  }

  public <T> Parser<HttpRequest<T>> parseRequest(Input input) {
    return HttpRequestParser.parse(input, this);
  }

  public <T> HttpRequest<T> parseRequestString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<HttpRequest<T>> parser = parseRequest(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public <T> Parser<HttpResponse<T>> responseParser() {
    return new HttpResponseParser<T>(this);
  }

  public <T> Parser<HttpResponse<T>> parseResponse(Input input) {
    return HttpResponseParser.parse(input, this);
  }

  public <T> HttpResponse<T> parseResponseString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<HttpResponse<T>> parser = parseResponse(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<HttpMethod> methodParser() {
    return new HttpMethodParser(this);
  }

  public Parser<HttpMethod> parseMethod(Input input) {
    return HttpMethodParser.parse(input, this);
  }

  public HttpMethod parseMethodString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<HttpMethod> parser = parseMethod(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<HttpStatus> statusParser() {
    return new HttpStatusParser(this);
  }

  public Parser<HttpStatus> parseStatus(Input input) {
    return HttpStatusParser.parse(input, this);
  }

  public HttpStatus parseStatusString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<HttpStatus> parser = parseStatus(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<HttpVersion> versionParser() {
    return new HttpVersionParser(this);
  }

  public Parser<HttpVersion> parseVersion(Input input) {
    return HttpVersionParser.parse(input, this);
  }

  public HttpVersion parseVersionString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<HttpVersion> parser = parseVersion(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<HttpHeader> headerParser() {
    return new HttpHeaderParser(this);
  }

  public Parser<HttpHeader> parseHeader(Input input) {
    return HttpHeaderParser.parse(input, this);
  }

  public HttpHeader parseHeaderString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<? extends HttpHeader> parser = parseHeader(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<? extends HttpHeader> parseHeaderValue(String name, Input input) {
    if ("Accept".equalsIgnoreCase(name)) {
      return Accept.parseHttpValue(input, this);
    } else if ("Accept-Charset".equalsIgnoreCase(name)) {
      return AcceptCharset.parseHttpValue(input, this);
    } else if ("Accept-Encoding".equalsIgnoreCase(name)) {
      return AcceptEncoding.parseHttpValue(input, this);
    } else if ("Accept-Language".equalsIgnoreCase(name)) {
      return AcceptLanguage.parseHttpValue(input, this);
    } else if ("Allow".equalsIgnoreCase(name)) {
      return Allow.parseHttpValue(input, this);
    } else if ("Connection".equalsIgnoreCase(name)) {
      return Connection.parseHttpValue(input, this);
    } else if ("Content-Encoding".equalsIgnoreCase(name)) {
      return ContentEncoding.parseHttpValue(input, this);
    } else if ("Content-Length".equalsIgnoreCase(name)) {
      return ContentLength.parseHttpValue(input, this);
    } else if ("Content-Type".equalsIgnoreCase(name)) {
      return ContentType.parseHttpValue(input, this);
    } else if ("Expect".equalsIgnoreCase(name)) {
      return Expect.parseHttpValue(input, this);
    } else if ("Host".equalsIgnoreCase(name)) {
      return Host.parseHttpValue(input, this);
    } else if ("Max-Forwards".equalsIgnoreCase(name)) {
      return MaxForwards.parseHttpValue(input, this);
    } else if ("Origin".equalsIgnoreCase(name)) {
      return Origin.parseHttpValue(input, this);
    } else if ("Sec-WebSocket-Accept".equalsIgnoreCase(name)) {
      return SecWebSocketAccept.parseHttpValue(input, this);
    } else if ("Sec-WebSocket-Extensions".equalsIgnoreCase(name)) {
      return SecWebSocketExtensions.parseHttpValue(input, this);
    } else if ("Sec-WebSocket-Key".equalsIgnoreCase(name)) {
      return SecWebSocketKey.parseHttpValue(input, this);
    } else if ("Sec-WebSocket-Protocol".equalsIgnoreCase(name)) {
      return SecWebSocketProtocol.parseHttpValue(input, this);
    } else if ("Sec-WebSocket-Version".equalsIgnoreCase(name)) {
      return SecWebSocketVersion.parseHttpValue(input, this);
    } else if ("Server".equals(name)) {
      return Server.parseHttpValue(input, this);
    } else if ("Transfer-Encoding".equalsIgnoreCase(name)) {
      return TransferEncoding.parseHttpValue(input, this);
    } else if ("Upgrade".equalsIgnoreCase(name)) {
      return Upgrade.parseHttpValue(input, this);
    } else if ("User-Agent".equalsIgnoreCase(name)) {
      return UserAgent.parseHttpValue(input, this);
    } else {
      return RawHeader.parseHttpValue(input, this, name.toLowerCase(), name);
    }
  }

  public Parser<HttpChunkHeader> chunkHeaderParser() {
    return new HttpChunkHeaderParser(this);
  }

  public Parser<HttpChunkHeader> parseChunkHeader(Input input) {
    return HttpChunkHeaderParser.parse(input, this);
  }

  public HttpChunkHeader parseChunkHeaderString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<HttpChunkHeader> parser = parseChunkHeader(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<HttpChunkTrailer> chunkTrailerParser() {
    return new HttpChunkTrailerParser(this);
  }

  public Parser<HttpChunkTrailer> parseChunkTrailer(Input input) {
    return HttpChunkTrailerParser.parse(input, this);
  }

  public HttpChunkTrailer parseChunkTrailerString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<HttpChunkTrailer> parser = parseChunkTrailer(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<ChunkExtension> chunkExtensionParser() {
    return new ChunkExtensionParser(this);
  }

  public Parser<ChunkExtension> parseChunkExtension(Input input) {
    return ChunkExtensionParser.parse(input, this);
  }

  public ChunkExtension parseChunkExtensionString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<ChunkExtension> parser = parseChunkExtension(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<HttpCharset> charsetParser() {
    return new HttpCharsetParser(this);
  }

  public Parser<HttpCharset> parseCharset(Input input) {
    return HttpCharsetParser.parse(input, this);
  }

  public HttpCharset parseCharsetString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<HttpCharset> parser = parseCharset(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<LanguageRange> languageRangeParser() {
    return new LanguageRangeParser(this);
  }

  public Parser<LanguageRange> parseLanguageRange(Input input) {
    return LanguageRangeParser.parse(input, this);
  }

  public LanguageRange parseLanguageRangeString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<LanguageRange> parser = parseLanguageRange(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<MediaRange> mediaRangeParser() {
    return new MediaRangeParser(this);
  }

  public Parser<MediaRange> parseMediaRange(Input input) {
    return MediaRangeParser.parse(input, this);
  }

  public MediaRange parseMediaRangeString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<MediaRange> parser = parseMediaRange(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<MediaType> mediaTypeParser() {
    return new MediaTypeParser(this);
  }

  public Parser<MediaType> parseMediaType(Input input) {
    return MediaTypeParser.parse(input, this);
  }

  public MediaType parseMediaTypeString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<MediaType> parser = parseMediaType(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<Product> productParser() {
    return new ProductParser(this);
  }

  public Parser<Product> parseProduct(Input input) {
    return ProductParser.parse(input, this);
  }

  public Product parseProductString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<Product> parser = parseProduct(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<ContentCoding> contentCodingParser() {
    return new ContentCodingParser(this);
  }

  public Parser<ContentCoding> parseContentCoding(Input input) {
    return ContentCodingParser.parse(input, this);
  }

  public ContentCoding parseContentCodingString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<ContentCoding> parser = parseContentCoding(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<TransferCoding> transferCodingParser() {
    return new TransferCodingParser(this);
  }

  public Parser<TransferCoding> parseTransferCoding(Input input) {
    return TransferCodingParser.parse(input, this);
  }

  public TransferCoding parseTransferCodingString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<TransferCoding> parser = parseTransferCoding(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<UpgradeProtocol> upgradeProtocolParser() {
    return new UpgradeProtocolParser(this);
  }

  public Parser<UpgradeProtocol> parseUpgradeProtocol(Input input) {
    return UpgradeProtocolParser.parse(input, this);
  }

  public UpgradeProtocol parseUpgradeProtocolString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<UpgradeProtocol> parser = parseUpgradeProtocol(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<WebSocketParam> webSocketParamParser() {
    return new WebSocketParamParser(this);
  }

  public Parser<WebSocketParam> parseWebSocketParam(Input input) {
    return WebSocketParamParser.parse(input, this);
  }

  public WebSocketParam parseWebSocketParamString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<WebSocketParam> parser = parseWebSocketParam(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<WebSocketExtension> webSocketExtensionParser() {
    return new WebSocketExtensionParser(this);
  }

  public Parser<WebSocketExtension> parseWebSocketExtension(Input input) {
    return WebSocketExtensionParser.parse(input, this);
  }

  public WebSocketExtension parseWebSocketExtensionString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<WebSocketExtension> parser = parseWebSocketExtension(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<Float> parseQValue(Input input) {
    return QValueParser.parse(input);
  }

  public Parser<Float> parseQValueRest(Input input) {
    return QValueParser.parseRest(input);
  }

  public Parser<String> parseComment(Input input) {
    return CommentParser.parse(input);
  }

  public Parser<FingerTrieSeq<String>> parseTokenList(Input input) {
    return TokenListParser.parse(input);
  }

  public Parser<HashTrieMap<String, String>> parseParamMap(Input input) {
    return ParamMapParser.parse(input);
  }

  public Parser<HashTrieMap<String, String>> parseParamMapRest(Input input) {
    return ParamMapParser.parseRest(input);
  }

  public Parser<HashTrieMap<String, String>> parseParamMapRest(StringBuilder key, Input input) {
    return ParamMapParser.parseRest(input, key);
  }

  public <T> Decoder<HttpMessage<T>> bodyDecoder(HttpMessage<?> message, Decoder<T> content, long length) {
    return new HttpBodyDecoder<T>(message, content, length);
  }

  public <T> Decoder<HttpMessage<T>> decodeBody(HttpMessage<?> message, Decoder<T> content,
                                                long length, InputBuffer input) {
    return HttpBodyDecoder.decode(input, message, content, length);
  }

  public <T> Decoder<HttpMessage<T>> chunkedDecoder(HttpMessage<?> message, Decoder<T> content) {
    return new HttpChunkedDecoder<T>(this, message, content);
  }

  public <T> Decoder<HttpMessage<T>> decodeChunked(HttpMessage<?> message, Decoder<T> content,
                                                   InputBuffer input) {
    return HttpChunkedDecoder.decode(input, this, message, content);
  }
}
