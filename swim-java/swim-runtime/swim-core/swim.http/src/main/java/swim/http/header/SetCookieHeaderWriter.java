package swim.http.header;

import swim.codec.Output;
import swim.codec.Writer;
import swim.collections.HashTrieMap;
import swim.http.Cookie;
import swim.http.HttpWriter;

final class SetCookieHeaderWriter extends Writer<Object, Object> {

  final HttpWriter http;
  final Cookie cookie;
  final HashTrieMap<String, String> params;
  final Writer<?, ?> part;
  final int step;

  SetCookieHeaderWriter(HttpWriter http, Cookie cookie, HashTrieMap<String, String> params,
                        Writer<?, ?> part, int step) {
    this.http = http;
    this.cookie = cookie;
    this.params = params;
    this.part = part;
    this.step = step;
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return SetCookieHeaderWriter.write(output, this.http, this.cookie, this.params, this.part, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http,
                                      Cookie cookie, HashTrieMap<String, String> params,
                                      Writer<?, ?> part, int step) {

    if (step == 1) {
      if (part == null) {
        part = cookie.writeHttp(output, http);
      } else {
        part = part.pull(output);
      }

      if (part.isDone()) {
        part = null;
        if (params.isEmpty()) {
          return Writer.done();
        } else {
          step = 2;
        }
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 2) {
      if (part == null) {
        part = http.writeParamMap(output, params.iterator());
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        return Writer.done();
      } else if (part.isError()) {
        return part.asError();
      }
    }
    return new SetCookieHeaderWriter(http, cookie, params, part, step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http,
                                      Cookie cookie, HashTrieMap<String, String> params) {
    return SetCookieHeaderWriter.write(output, http, cookie, params, null, 1);
  }

}
