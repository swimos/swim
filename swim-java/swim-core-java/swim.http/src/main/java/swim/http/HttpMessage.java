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
import swim.codec.Encoder;
import swim.codec.OutputBuffer;
import swim.codec.Utf8;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieSet;
import swim.decipher.Decipher;
import swim.http.header.ContentLength;
import swim.http.header.ContentType;
import swim.http.header.TransferEncoding;
import swim.json.Json;
import swim.recon.Recon;
import swim.util.Builder;
import swim.xml.Xml;

public abstract class HttpMessage<T> extends HttpPart {
  public abstract HttpVersion version();

  public abstract FingerTrieSeq<HttpHeader> headers();

  public HttpHeader getHeader(String name) {
    final FingerTrieSeq<HttpHeader> headers = headers();
    for (int i = 0, n = headers.size(); i < n; i += 1) {
      final HttpHeader header = headers.get(i);
      if (name.equalsIgnoreCase(header.name())) {
        return header;
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  public <H extends HttpHeader> H getHeader(Class<H> headerClass) {
    final FingerTrieSeq<HttpHeader> headers = headers();
    for (int i = 0, n = headers.size(); i < n; i += 1) {
      final HttpHeader header = headers.get(i);
      if (headerClass.isInstance(header)) {
        return (H) header;
      }
    }
    return null;
  }

  public abstract HttpMessage<T> headers(FingerTrieSeq<HttpHeader> headers);

  public abstract HttpMessage<T> headers(HttpHeader... headers);

  public abstract HttpMessage<T> appendedHeaders(FingerTrieSeq<HttpHeader> newHeaders);

  public abstract HttpMessage<T> appendedHeaders(HttpHeader... newHeaders);

  public abstract HttpMessage<T> appendedHeader(HttpHeader newHeader);

  public abstract HttpMessage<T> updatedHeaders(FingerTrieSeq<HttpHeader> newHeaders);

  public abstract HttpMessage<T> updatedHeaders(HttpHeader... newHeaders);

  public abstract HttpMessage<T> updatedHeader(HttpHeader newHeader);

  public abstract HttpEntity<T> entity();

  public abstract <T2> HttpMessage<T2> entity(HttpEntity<T2> entity);

  public abstract <T2> HttpMessage<T2> content(HttpEntity<T2> entity);

  public abstract HttpMessage<String> body(String content, MediaType mediaType);

  public abstract HttpMessage<String> body(String content);

  public <T2> Decoder<? extends HttpMessage<T2>> entityDecoder(Decoder<T2> contentDecoder) {
    int bodyType = 0;
    long length = 0L;
    final FingerTrieSeq<HttpHeader> headers = headers();
    for (int i = 0, n = headers.size(); i < n; i += 1) {
      final HttpHeader header = headers.get(i);
      if (header instanceof ContentLength) {
        if (bodyType == 0) {
          length = ((ContentLength) header).length();
          bodyType = 1;
        } else if (bodyType == 1) {
          return Decoder.error(new HttpException("conflicting Content-Length"));
        } else if (bodyType == 2) {
          return Decoder.error(new HttpException("conflicting Content-Length and chunked Transfer-Encoding"));
        }
      } else if (header instanceof TransferEncoding) {
        final FingerTrieSeq<TransferCoding> codings = ((TransferEncoding) header).codings();
        for (int j = 0, k = codings.size(); j < k; j += 1) {
          final TransferCoding coding = codings.get(j);
          if (coding.isChunked()) {
            if (bodyType == 0) {
              bodyType = 2;
            } else if (bodyType == 1) {
              return Decoder.error(new HttpException("conflicting Content-Length and chunked Transfer-Encoding"));
            } else if (bodyType == 2) {
              return Decoder.error(new HttpException("conflicting Transfer-Encoding"));
            }
          } else {
            return Decoder.error(new HttpException("unsupported Transfer-Encoding: " + coding.toHttp()));
          }
        }
      }
    }
    if (bodyType == 1 && length > 0L) {
      return HttpBody.httpDecoder(this, contentDecoder, length);
    } else if (bodyType == 2) {
      return HttpChunked.httpDecoder(this, contentDecoder);
    } else {
      return Decoder.done(entity(HttpEntity.<T2>empty()));
    }
  }

  @SuppressWarnings("unchecked")
  public Decoder<Object> contentDecoder(MediaType mediaType) {
    if (mediaType.isText()) {
      return (Decoder<Object>) (Decoder<?>) Utf8.stringParser();
    } else if (mediaType.isApplication()) {
      if ("json".equalsIgnoreCase(mediaType.subtype)) {
        return (Decoder<Object>) (Decoder<?>) Utf8.decodedParser(Json.structureParser().valueParser());
      } else if ("recon".equalsIgnoreCase(mediaType.subtype)
              || "x-recon".equalsIgnoreCase(mediaType.subtype)) {
        return (Decoder<Object>) (Decoder<?>) Utf8.decodedParser(Recon.structureParser().blockParser());
      } else if ("xml".equalsIgnoreCase(mediaType.subtype)) {
        return (Decoder<Object>) (Decoder<?>) Utf8.decodedParser(Xml.structureParser().documentParser());
      }
    }
    return (Decoder<Object>) (Decoder<?>) Decipher.structureDecoder().anyDecoder();
  }

  public Decoder<Object> contentDecoder() {
    final FingerTrieSeq<HttpHeader> headers = headers();
    for (int i = 0, n = headers.size(); i < n; i += 1) {
      final HttpHeader header = headers.get(i);
      if (header instanceof ContentType) {
        return contentDecoder(((ContentType) header).mediaType());
      }
    }
    return contentDecoder(MediaType.applicationOctetStream());
  }

  public Encoder<?, ? extends HttpMessage<T>> httpEncoder(HttpWriter http) {
    return new HttpMessageEncoder<T>(http, this);
  }

  public Encoder<?, ? extends HttpMessage<T>> httpEncoder() {
    return httpEncoder(Http.standardWriter());
  }

  public Encoder<?, ? extends HttpMessage<T>> encodeHttp(OutputBuffer<?> output, HttpWriter http) {
    return HttpMessageEncoder.encode(output, http, this);
  }

  public Encoder<?, ? extends HttpMessage<T>> encodeHttp(OutputBuffer<?> output) {
    return encodeHttp(output, Http.standardWriter());
  }

  static FingerTrieSeq<HttpHeader> updatedHeaders(FingerTrieSeq<HttpHeader> oldHeaders, HttpHeader newHeader) {
    final Builder<HttpHeader, FingerTrieSeq<HttpHeader>> headers = FingerTrieSeq.builder();
    boolean updated = false;
    boolean changed = false;
    for (int i = 0, n = oldHeaders.size(); i < n; i += 1) {
      final HttpHeader oldHeader = oldHeaders.get(i);
      if (oldHeader.lowerCaseName().equals(newHeader.lowerCaseName())) {
        updated = true;
        if (!oldHeader.equals(newHeader)) {
          changed = true;
        }
        headers.add(newHeader);
      } else {
        headers.add(oldHeader);
      }
    }
    if (!updated) {
      headers.add(newHeader);
      changed = true;
    }
    if (changed) {
      return headers.bind();
    } else {
      return oldHeaders;
    }
  }

  static FingerTrieSeq<HttpHeader> updatedHeaders(FingerTrieSeq<HttpHeader> oldHeaders,
                                                  FingerTrieSeq<HttpHeader> newHeaders) {
    final int newHeaderCount = newHeaders.size();
    if (newHeaderCount == 0) {
      return oldHeaders;
    } else if (newHeaderCount == 1) {
      return updatedHeaders(oldHeaders, newHeaders.head());
    } else {
      final Builder<HttpHeader, FingerTrieSeq<HttpHeader>> headers = FingerTrieSeq.builder();
      final HashTrieSet<HttpHeader> absent = HashTrieSet.from(newHeaders);
      boolean changed = false;
      loop: for (int i = 0, oldHeaderCount = oldHeaders.size(); i < oldHeaderCount; i += 1) {
        final HttpHeader oldHeader = oldHeaders.get(i);
        for (int j = 0; j < newHeaderCount; j += 1) {
          final HttpHeader newHeader = newHeaders.get(j);
          if (oldHeader.lowerCaseName().equals(newHeader.lowerCaseName())) {
            absent.remove(newHeader);
            if (!oldHeader.equals(newHeader)) {
              changed = true;
            }
            headers.add(newHeader);
            continue loop;
          }
        }
        headers.add(oldHeader);
      }
      if (!absent.isEmpty()) {
        for (int j = 0; j < newHeaderCount; j += 1) {
          final HttpHeader newHeader = newHeaders.get(j);
          if (absent.contains(newHeader)) {
            headers.add(newHeader);
            changed = true;
          }
        }
      }
      if (changed) {
        return headers.bind();
      } else {
        return oldHeaders;
      }
    }
  }
}
