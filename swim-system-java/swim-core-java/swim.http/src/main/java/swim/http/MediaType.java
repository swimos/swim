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

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.Writer;
import swim.collections.HashTrieMap;
import swim.util.Murmur3;

public final class MediaType extends HttpPart implements Debug {
  final String type;
  final String subtype;
  final HashTrieMap<String, String> params;

  MediaType(String type, String subtype, HashTrieMap<String, String> params) {
    this.type = type;
    this.subtype = subtype;
    this.params = params;
  }

  MediaType(String type, String subtype) {
    this(type, subtype, HashTrieMap.<String, String>empty());
  }

  public boolean isApplication() {
    return "application".equalsIgnoreCase(type);
  }

  public boolean isAudio() {
    return "audio".equalsIgnoreCase(type);
  }

  public boolean isImage() {
    return "image".equalsIgnoreCase(type);
  }

  public boolean isMultipart() {
    return "multipart".equalsIgnoreCase(type);
  }

  public boolean isText() {
    return "text".equalsIgnoreCase(type);
  }

  public boolean isVideo() {
    return "video".equalsIgnoreCase(type);
  }

  public String type() {
    return this.type;
  }

  public String subtype() {
    return this.subtype;
  }

  public HashTrieMap<String, String> params() {
    return this.params;
  }

  public String getParam(String key) {
    return this.params.get(key);
  }

  public MediaType param(String key, String value) {
    return MediaType.from(this.type, this.subtype, this.params.updated(key, value));
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.mediaTypeWriter(this.type, this.subtype, this.params);
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeMediaType(this.type, this.subtype, this.params, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MediaType) {
      final MediaType that = (MediaType) other;
      return this.type.equals(that.type) && this.subtype.equals(that.subtype)
          && this.params.equals(that.params);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(MediaType.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.type.hashCode()), this.subtype.hashCode()), this.params.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("MediaType").write('.').write("from").write('(')
        .debug(this.type).write(", ").write(this.subtype).write(')');
    for (HashTrieMap.Entry<String, String> param : this.params) {
      output = output.write('.').write("param").write('(')
          .debug(param.getKey()).write(", ").debug(param.getValue()).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static MediaType applicationJavascript;
  private static MediaType applicationJson;
  private static MediaType applicationOctetStream;
  private static MediaType applicationXml;
  private static MediaType applicationXRecon;
  private static MediaType imageJpeg;
  private static MediaType imagePng;
  private static MediaType imageSvgXml;
  private static MediaType textCss;
  private static MediaType textHtml;
  private static MediaType textPlain;

  public static MediaType applicationJavascript() {
    if (applicationJavascript == null) {
      applicationJavascript = new MediaType("application", "javascript");
    }
    return applicationJavascript;
  }

  public static MediaType applicationJson() {
    if (applicationJson == null) {
      applicationJson = new MediaType("application", "json");
    }
    return applicationJson;
  }

  public static MediaType applicationOctetStream() {
    if (applicationOctetStream == null) {
      applicationOctetStream = new MediaType("application", "octet-stream");
    }
    return applicationOctetStream;
  }

  public static MediaType applicationXml() {
    if (applicationXml == null) {
      applicationXml = new MediaType("application", "xml");
    }
    return applicationXml;
  }

  public static MediaType applicationXRecon() {
    if (applicationXRecon == null) {
      applicationXRecon = new MediaType("application", "x-recon");
    }
    return applicationXRecon;
  }

  public static MediaType imageJpeg() {
    if (imageJpeg == null) {
      imageJpeg = new MediaType("image", "jpeg");
    }
    return imageJpeg;
  }

  public static MediaType imagePng() {
    if (imagePng == null) {
      imagePng = new MediaType("image", "png");
    }
    return imagePng;
  }

  public static MediaType imageSvgXml() {
    if (imageSvgXml == null) {
      imageSvgXml = new MediaType("image", "svg+xml");
    }
    return imageSvgXml;
  }

  public static MediaType textCss() {
    if (textCss == null) {
      textCss = new MediaType("text", "css");
    }
    return textCss;
  }

  public static MediaType textHtml() {
    if (textHtml == null) {
      textHtml = new MediaType("text", "html");
    }
    return textHtml;
  }

  public static MediaType textPlain() {
    if (textPlain == null) {
      textPlain = new MediaType("text", "plain");
    }
    return textPlain;
  }

  public static MediaType from(String type, String subtype, HashTrieMap<String, String> params) {
    if (params.isEmpty()) {
      if ("application".equals(type)) {
        if ("javascript".equals(subtype)) {
          return applicationJavascript();
        } else if ("json".equals(subtype)) {
          return applicationJson();
        } else if ("octet-stream".equals(subtype)) {
          return applicationOctetStream();
        } else if ("xml".equals(subtype)) {
          return applicationXml();
        } else if ("x-recon".equals(subtype)) {
          return applicationXRecon();
        }
      } else if ("image".equals(type)) {
        if ("jpeg".equals(subtype)) {
          return imageJpeg();
        } else if ("png".equals(subtype)) {
          return imagePng();
        } else if ("svg+xml".equals(subtype)) {
          return imageSvgXml();
        }
      } else if ("text".equals(type)) {
        if ("css".equals(subtype)) {
          return textCss();
        } else if ("html".equals(subtype)) {
          return textHtml();
        } else if ("plain".equals(subtype)) {
          return textPlain();
        }
      }
    }
    return new MediaType(type, subtype, params);
  }

  public static MediaType from(String type, String subtype) {
    return from(type, subtype, HashTrieMap.<String, String>empty());
  }

  public static MediaType parse(String string) {
    return Http.standardParser().parseMediaTypeString(string);
  }

  public static MediaType forPath(String path) {
    if (path.endsWith(".js")) {
      return applicationJavascript();
    } else if (path.endsWith(".json")) {
      return applicationJson();
    } else if (path.endsWith(".xml")) {
      return applicationXml();
    } else if (path.endsWith(".recon")) {
      return applicationXRecon();
    } else if (path.endsWith(".jpeg") || path.endsWith(".jpg")) {
      return imageJpeg();
    } else if (path.endsWith(".png")) {
      return imagePng();
    } else if (path.endsWith(".svg")) {
      return imageSvgXml();
    } else if (path.endsWith(".css")) {
      return textCss();
    } else if (path.endsWith(".html")) {
      return textHtml();
    } else if (path.endsWith(".txt")) {
      return textPlain();
    } else {
      return null;
    }
  }
}
