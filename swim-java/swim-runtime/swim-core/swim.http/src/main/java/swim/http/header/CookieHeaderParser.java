package swim.http.header;

import swim.codec.Input;
import swim.codec.Parser;
import swim.collections.FingerTrieSeq;
import swim.http.Cookie;
import swim.http.Http;
import swim.http.HttpParser;
import swim.util.Builder;

public class CookieHeaderParser extends Parser<CookieHeader> {

  final HttpParser http;
  final Parser<Cookie> cookiesParser;
  final Builder<Cookie, FingerTrieSeq<Cookie>> cookies;
  final int step;

  CookieHeaderParser(HttpParser http, Parser<Cookie> cookiesParser,
                     Builder<Cookie, FingerTrieSeq<Cookie>> cookies, int step) {
    this.http = http;
    this.cookiesParser = cookiesParser;
    this.cookies = cookies;
    this.step = step;
  }

  CookieHeaderParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<CookieHeader> feed(Input input) {
    return CookieHeaderParser.parse(input, this.http, this.cookiesParser, this.cookies, this.step);
  }

  static Parser<CookieHeader> parse(Input input, HttpParser http, Parser<Cookie> cookieParser,
                                    Builder<Cookie, FingerTrieSeq<Cookie>> cookies, int step) {


    int c = 0;
    if (step == 1) {
      if (cookieParser == null) {
        cookieParser = http.parseCookie(input);
      } else {
        cookieParser = cookieParser.feed(input);
      }
      if (cookieParser.isDone()) {
        if (cookies == null) {
          cookies = FingerTrieSeq.builder();
        }
        cookies.add(cookieParser.bind());
        cookieParser = null;
        step = 2;
      } else if (cookieParser.isError()) {
        return cookieParser.asError();
      }
    }
    do {
      if (step == 2) {
        if (input.isCont()) {
          c = input.head();
          if (c == ';') {
            input = input.step();
          }
        }
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont() && Http.isVisibleChar(c)) {
          step = 3;
        } else if (!input.isEmpty()) {
          return Parser.done(CookieHeader.create(cookies.bind()));
        }
      }
      if (step == 3) {
        if (cookieParser == null) {
          cookieParser = http.parseCookie(input);
        } else {
          cookieParser = cookieParser.feed(input);
        }
        if (cookieParser.isDone()) {
          cookies.add(cookieParser.bind());
          cookieParser = null;
          step = 2;
          continue;
        } else if (cookieParser.isError()) {
          return cookieParser.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new CookieHeaderParser(http, cookieParser, cookies, step);
  }

  static Parser<CookieHeader> parse(Input input, HttpParser http) {
    return CookieHeaderParser.parse(input, http, null, null, 1);
  }

}
