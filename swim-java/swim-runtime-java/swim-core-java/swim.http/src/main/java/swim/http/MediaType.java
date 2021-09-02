// Copyright 2015-2021 Swim Inc.
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
    return "application".equalsIgnoreCase(this.type);
  }

  public boolean isAudio() {
    return "audio".equalsIgnoreCase(this.type);
  }

  public boolean isImage() {
    return "image".equalsIgnoreCase(this.type);
  }

  public boolean isMultipart() {
    return "multipart".equalsIgnoreCase(this.type);
  }

  public boolean isText() {
    return "text".equalsIgnoreCase(this.type);
  }

  public boolean isVideo() {
    return "video".equalsIgnoreCase(this.type);
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
    return MediaType.create(this.type, this.subtype, this.params.updated(key, value));
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.mediaTypeWriter(this.type, this.subtype, this.params);
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeMediaType(output, this.type, this.subtype, this.params);
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

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (MediaType.hashSeed == 0) {
      MediaType.hashSeed = Murmur3.seed(MediaType.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(MediaType.hashSeed,
        this.type.hashCode()), this.subtype.hashCode()), this.params.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("MediaType").write('.').write("create").write('(')
                   .debug(this.type).write(", ").write(this.subtype).write(')');
    for (HashTrieMap.Entry<String, String> param : this.params) {
      output = output.write('.').write("param").write('(')
                     .debug(param.getKey()).write(", ")
                     .debug(param.getValue()).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static MediaType applicationJavascript;

  public static MediaType applicationJavascript() {
    if (MediaType.applicationJavascript == null) {
      MediaType.applicationJavascript = new MediaType("application", "javascript");
    }
    return MediaType.applicationJavascript;
  }

  private static MediaType applicationJson;

  public static MediaType applicationJson() {
    if (MediaType.applicationJson == null) {
      MediaType.applicationJson = new MediaType("application", "json");
    }
    return MediaType.applicationJson;
  }

  private static MediaType applicationOctetStream;

  public static MediaType applicationOctetStream() {
    if (MediaType.applicationOctetStream == null) {
      MediaType.applicationOctetStream = new MediaType("application", "octet-stream");
    }
    return MediaType.applicationOctetStream;
  }

  private static MediaType applicationXml;

  public static MediaType applicationXml() {
    if (MediaType.applicationXml == null) {
      MediaType.applicationXml = new MediaType("application", "xml");
    }
    return MediaType.applicationXml;
  }

  private static MediaType applicationXRecon;

  public static MediaType applicationXRecon() {
    if (MediaType.applicationXRecon == null) {
      MediaType.applicationXRecon = new MediaType("application", "x-recon");
    }
    return MediaType.applicationXRecon;
  }

  private static MediaType imageJpeg;

  public static MediaType imageJpeg() {
    if (MediaType.imageJpeg == null) {
      MediaType.imageJpeg = new MediaType("image", "jpeg");
    }
    return MediaType.imageJpeg;
  }

  private static MediaType imagePng;

  public static MediaType imagePng() {
    if (MediaType.imagePng == null) {
      MediaType.imagePng = new MediaType("image", "png");
    }
    return MediaType.imagePng;
  }

  private static MediaType imageSvgXml;

  public static MediaType imageSvgXml() {
    if (MediaType.imageSvgXml == null) {
      MediaType.imageSvgXml = new MediaType("image", "svg+xml");
    }
    return MediaType.imageSvgXml;
  }

  private static MediaType textCss;

  public static MediaType textCss() {
    if (MediaType.textCss == null) {
      MediaType.textCss = new MediaType("text", "css");
    }
    return MediaType.textCss;
  }

  private static MediaType textHtml;

  public static MediaType textHtml() {
    if (MediaType.textHtml == null) {
      MediaType.textHtml = new MediaType("text", "html");
    }
    return MediaType.textHtml;
  }

  private static MediaType textPlain;

  public static MediaType textPlain() {
    if (MediaType.textPlain == null) {
      MediaType.textPlain = new MediaType("text", "plain");
    }
    return MediaType.textPlain;
  }

  public static MediaType create(String type, String subtype,
                                 HashTrieMap<String, String> params) {
    if (params.isEmpty()) {
      if ("application".equals(type)) {
        if ("javascript".equals(subtype)) {
          return MediaType.applicationJavascript();
        } else if ("json".equals(subtype)) {
          return MediaType.applicationJson();
        } else if ("octet-stream".equals(subtype)) {
          return MediaType.applicationOctetStream();
        } else if ("xml".equals(subtype)) {
          return MediaType.applicationXml();
        } else if ("x-recon".equals(subtype)) {
          return MediaType.applicationXRecon();
        }
      } else if ("image".equals(type)) {
        if ("jpeg".equals(subtype)) {
          return MediaType.imageJpeg();
        } else if ("png".equals(subtype)) {
          return MediaType.imagePng();
        } else if ("svg+xml".equals(subtype)) {
          return MediaType.imageSvgXml();
        }
      } else if ("text".equals(type)) {
        if ("css".equals(subtype)) {
          return MediaType.textCss();
        } else if ("html".equals(subtype)) {
          return MediaType.textHtml();
        } else if ("plain".equals(subtype)) {
          return MediaType.textPlain();
        }
      }
    }
    return new MediaType(type, subtype, params);
  }

  public static MediaType create(String type, String subtype) {
    return MediaType.create(type, subtype, HashTrieMap.<String, String>empty());
  }

  public static MediaType parse(String string) {
    return Http.standardParser().parseMediaTypeString(string);
  }

  public static MediaType forPath(String path) {
    // TODO: configurable extension mapping
    if (".js".endsWith(path)) {
      return MediaType.applicationJavascript();
    } else if (".json".endsWith(path)) {
      return MediaType.applicationJson();
    } else if (".xml".endsWith(path)) {
      return MediaType.applicationXml();
    } else if (".recon".endsWith(path)) {
      return MediaType.applicationXRecon();
    } else if (".jpeg".endsWith(path) || ".jpg".endsWith(path)) {
      return MediaType.imageJpeg();
    } else if (".png".endsWith(path)) {
      return MediaType.imagePng();
    } else if (".svg".endsWith(path)) {
      return MediaType.imageSvgXml();
    } else if (".css".endsWith(path)) {
      return MediaType.textCss();
    } else if (".html".endsWith(path)) {
      return MediaType.textHtml();
    } else if (".txt".endsWith(path)) {
      return MediaType.textPlain();
    } else {
      return null;
    }
  }

}
