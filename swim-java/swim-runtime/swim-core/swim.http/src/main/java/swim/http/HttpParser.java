// Copyright 2015-2022 Swim.inc
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
import swim.http.header.AcceptCharsetHeader;
import swim.http.header.AcceptEncodingHeader;
import swim.http.header.AcceptHeader;
import swim.http.header.AcceptLanguageHeader;
import swim.http.header.AllowHeader;
import swim.http.header.ConnectionHeader;
import swim.http.header.ContentEncodingHeader;
import swim.http.header.ContentLengthHeader;
import swim.http.header.ContentTypeHeader;
import swim.http.header.CookieHeader;
import swim.http.header.ExpectHeader;
import swim.http.header.HostHeader;
import swim.http.header.MaxForwardsHeader;
import swim.http.header.OriginHeader;
import swim.http.header.RawHeader;
import swim.http.header.SecWebSocketAcceptHeader;
import swim.http.header.SecWebSocketExtensionsHeader;
import swim.http.header.SecWebSocketKeyHeader;
import swim.http.header.SecWebSocketProtocolHeader;
import swim.http.header.SecWebSocketVersionHeader;
import swim.http.header.ServerHeader;
import swim.http.header.TransferEncodingHeader;
import swim.http.header.UpgradeHeader;
import swim.http.header.UserAgentHeader;
import swim.uri.Uri;

public class HttpParser {

  public HttpParser() {
    // nop
  }

  public <T> HttpRequest<T> request(HttpMethod method, Uri uri, HttpVersion version,
                                    FingerTrieSeq<HttpHeader> headers) {
    return HttpRequest.create(method, uri, version, headers);
  }

  public <T> HttpResponse<T> response(HttpVersion version, HttpStatus status,
                                      FingerTrieSeq<HttpHeader> headers) {
    return HttpResponse.create(version, status, headers);
  }

  public HttpMethod method(String name) {
    return HttpMethod.create(name);
  }

  public HttpStatus status(int code, String phrase) {
    return HttpStatus.create(code, phrase);
  }

  public HttpVersion version(int major, int minor) {
    return HttpVersion.create(major, minor);
  }

  public HttpChunkHeader chunkHeader(long size, FingerTrieSeq<ChunkExtension> extensions) {
    return HttpChunkHeader.create(size, extensions);
  }

  public HttpChunkTrailer chunkTrailer(FingerTrieSeq<HttpHeader> headers) {
    return HttpChunkTrailer.create(headers);
  }

  public ChunkExtension chunkExtension(String name, String value) {
    return ChunkExtension.create(name, value);
  }

  public HttpCharset charset(String name, float weight) {
    return HttpCharset.create(name, weight);
  }

  public LanguageRange languageRange(String tag, String subtag, float weight) {
    return LanguageRange.create(tag, subtag, weight);
  }

  public MediaRange mediaRange(String type, String subtype, float weight,
                               HashTrieMap<String, String> params) {
    return MediaRange.create(type, subtype, weight, params);
  }

  public MediaType mediaType(String type, String subtype, HashTrieMap<String, String> params) {
    return MediaType.create(type, subtype, params);
  }

  public Product product(String name, String version, FingerTrieSeq<String> comments) {
    return Product.create(name, version, comments);
  }

  public ContentCoding contentCoding(String name, float weight) {
    return ContentCoding.create(name, weight);
  }

  public TransferCoding transferCoding(String name, HashTrieMap<String, String> params) {
    return TransferCoding.create(name, params);
  }

  public UpgradeProtocol upgradeProtocol(String name, String version) {
    return UpgradeProtocol.create(name, version);
  }

  public WebSocketParam webSocketParam(String key, String value) {
    return WebSocketParam.create(key, value);
  }

  public WebSocketExtension webSocketExtension(String name, FingerTrieSeq<WebSocketParam> params) {
    return WebSocketExtension.create(name, params);
  }

  public Cookie cookie(String name, String value) {
    return Cookie.create(name, value);
  }

  public <T> Parser<HttpRequest<T>> requestParser() {
    return new HttpRequestParser<T>(this);
  }

  public <T> Parser<HttpRequest<T>> parseRequest(Input input) {
    return HttpRequestParser.parse(input, this);
  }

  public <T> HttpRequest<T> parseRequestString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<HttpRequest<T>> parser = this.parseRequest(input);
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
    Parser<HttpResponse<T>> parser = this.parseResponse(input);
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
    Parser<HttpMethod> parser = this.parseMethod(input);
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
    Parser<HttpStatus> parser = this.parseStatus(input);
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
    Parser<HttpVersion> parser = this.parseVersion(input);
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
    Parser<? extends HttpHeader> parser = this.parseHeader(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<? extends HttpHeader> parseHeaderValue(Input input, String name) {
    if ("Accept".equalsIgnoreCase(name)) {
      return AcceptHeader.parseHeaderValue(input, this);
    } else if ("Accept-Charset".equalsIgnoreCase(name)) {
      return AcceptCharsetHeader.parseHeaderValue(input, this);
    } else if ("Accept-Encoding".equalsIgnoreCase(name)) {
      return AcceptEncodingHeader.parseHeaderValue(input, this);
    } else if ("Accept-Language".equalsIgnoreCase(name)) {
      return AcceptLanguageHeader.parseHeaderValue(input, this);
    } else if ("Allow".equalsIgnoreCase(name)) {
      return AllowHeader.parseHeaderValue(input, this);
    } else if ("Connection".equalsIgnoreCase(name)) {
      return ConnectionHeader.parseHeaderValue(input, this);
    } else if ("Content-Encoding".equalsIgnoreCase(name)) {
      return ContentEncodingHeader.parseHeaderValue(input, this);
    } else if ("Content-Length".equalsIgnoreCase(name)) {
      return ContentLengthHeader.parseHeaderValue(input, this);
    } else if ("Content-Type".equalsIgnoreCase(name)) {
      return ContentTypeHeader.parseHeaderValue(input, this);
    } else if ("Expect".equalsIgnoreCase(name)) {
      return ExpectHeader.parseHeaderValue(input, this);
    } else if ("Host".equalsIgnoreCase(name)) {
      return HostHeader.parseHeaderValue(input, this);
    } else if ("Max-Forwards".equalsIgnoreCase(name)) {
      return MaxForwardsHeader.parseHeaderValue(input, this);
    } else if ("Origin".equalsIgnoreCase(name)) {
      return OriginHeader.parseHeaderValue(input, this);
    } else if ("Sec-WebSocket-Accept".equalsIgnoreCase(name)) {
      return SecWebSocketAcceptHeader.parseHeaderValue(input, this);
    } else if ("Sec-WebSocket-Extensions".equalsIgnoreCase(name)) {
      return SecWebSocketExtensionsHeader.parseHeaderValue(input, this);
    } else if ("Sec-WebSocket-Key".equalsIgnoreCase(name)) {
      return SecWebSocketKeyHeader.parseHeaderValue(input, this);
    } else if ("Sec-WebSocket-Protocol".equalsIgnoreCase(name)) {
      return SecWebSocketProtocolHeader.parseHeaderValue(input, this);
    } else if ("Sec-WebSocket-Version".equalsIgnoreCase(name)) {
      return SecWebSocketVersionHeader.parseHeaderValue(input, this);
    } else if ("Server".equals(name)) {
      return ServerHeader.parseHeaderValue(input, this);
    } else if ("Transfer-Encoding".equalsIgnoreCase(name)) {
      return TransferEncodingHeader.parseHeaderValue(input, this);
    } else if ("Upgrade".equalsIgnoreCase(name)) {
      return UpgradeHeader.parseHeaderValue(input, this);
    } else if ("User-Agent".equalsIgnoreCase(name)) {
      return UserAgentHeader.parseHeaderValue(input, this);
    } else if ("Cookie".equalsIgnoreCase(name)) {
      return CookieHeader.parseHeaderValue(input, this);
    } else {
      return RawHeader.parseHeaderValue(input, this, name.toLowerCase(), name);
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
    Parser<HttpChunkHeader> parser = this.parseChunkHeader(input);
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
    Parser<HttpChunkTrailer> parser = this.parseChunkTrailer(input);
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
    Parser<ChunkExtension> parser = this.parseChunkExtension(input);
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
    Parser<HttpCharset> parser = this.parseCharset(input);
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
    Parser<LanguageRange> parser = this.parseLanguageRange(input);
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
    Parser<MediaRange> parser = this.parseMediaRange(input);
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
    Parser<MediaType> parser = this.parseMediaType(input);
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
    Parser<Product> parser = this.parseProduct(input);
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
    Parser<ContentCoding> parser = this.parseContentCoding(input);
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
    Parser<TransferCoding> parser = this.parseTransferCoding(input);
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
    Parser<UpgradeProtocol> parser = this.parseUpgradeProtocol(input);
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
    Parser<WebSocketParam> parser = this.parseWebSocketParam(input);
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
    Parser<WebSocketExtension> parser = this.parseWebSocketExtension(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<Cookie> cookieParser() {
    return new CookieParser(this);
  }

  public Parser<Cookie> parseCookie(Input input) {
    return CookieParser.parse(input, this);
  }

  public Cookie parseCookieString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<Cookie> parser = this.parseCookie(input);
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

  public Parser<HashTrieMap<String, String>> parseParamMapRest(Input input, StringBuilder key) {
    return ParamMapParser.parseRest(input, key);
  }

  public <T> Decoder<HttpMessage<T>> bodyDecoder(HttpMessage<?> message, Decoder<T> payloadDecoder,
                                                 long contentLength) {
    return new HttpBodyDecoder<T>(message, payloadDecoder, contentLength);
  }

  public <T> Decoder<HttpMessage<T>> decodeBody(InputBuffer input, HttpMessage<?> message,
                                                Decoder<T> payloadDecoder, long contentLength) {
    return HttpBodyDecoder.decode(input, message, payloadDecoder, contentLength);
  }

  public <T> Decoder<HttpMessage<T>> chunkedDecoder(HttpMessage<?> message, Decoder<T> payloadDecoder) {
    return new HttpChunkedDecoder<T>(this, message, payloadDecoder);
  }

  public <T> Decoder<HttpMessage<T>> decodeChunked(InputBuffer input, HttpMessage<?> message,
                                                   Decoder<T> payloadDecoder) {
    return HttpChunkedDecoder.decode(input, this, message, payloadDecoder);
  }

}
