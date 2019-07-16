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

package swim.uri;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class UriAbsoluteParser extends Parser<Uri> {
  final UriParser uri;
  final Parser<UriScheme> schemeParser;
  final Parser<UriAuthority> authorityParser;
  final Parser<UriPath> pathParser;
  final Parser<UriQuery> queryParser;
  final Parser<UriFragment> fragmentParser;
  final int step;

  UriAbsoluteParser(UriParser uri, Parser<UriScheme> schemeParser,
                    Parser<UriAuthority> authorityParser, Parser<UriPath> pathParser,
                    Parser<UriQuery> queryParser, Parser<UriFragment> fragmentParser, int step) {
    this.uri = uri;
    this.schemeParser = schemeParser;
    this.authorityParser = authorityParser;
    this.pathParser = pathParser;
    this.queryParser = queryParser;
    this.fragmentParser = fragmentParser;
    this.step = step;
  }

  UriAbsoluteParser(UriParser uri) {
    this(uri, null, null, null, null, null, 1);
  }

  @Override
  public Parser<Uri> feed(Input input) {
    return parse(input, this.uri, this.schemeParser, this.authorityParser,
                 this.pathParser, this.queryParser, this.fragmentParser, this.step);
  }

  static Parser<Uri> parse(Input input, UriParser uri, Parser<UriScheme> schemeParser,
                           Parser<UriAuthority> authorityParser, Parser<UriPath> pathParser,
                           Parser<UriQuery> queryParser, Parser<UriFragment> fragmentParser, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        Input look = input.clone();
        while (look.isCont()) {
          c = look.head();
          if (Uri.isSchemeChar(c)) {
            look = look.step();
          } else {
            break;
          }
        }
        if (look.isCont() && c == ':') {
          step = 2;
        } else {
          step = 3;
        }
      } else if (input.isDone()) {
        step = 3;
      }
    }
    if (step == 2) {
      if (schemeParser == null) {
        schemeParser = uri.parseScheme(input);
      } else {
        schemeParser = schemeParser.feed(input);
      }
      if (schemeParser.isDone()) {
        if (input.isCont() && input.head() == ':') {
          input = input.step();
          step = 3;
        } else if (!input.isEmpty()) {
          return error(Diagnostic.expected(':', input));
        }
      } else if (schemeParser.isError()) {
        return schemeParser.asError();
      }
    }
    if (step == 3) {
      if (input.isCont()) {
        c = input.head();
        if (c == '/') {
          input = input.step();
          step = 4;
        } else if (c == '?') {
          input = input.step();
          step = 7;
        } else if (c == '#') {
          input = input.step();
          step = 8;
        } else {
          step = 6;
        }
      } else if (input.isDone()) {
        return done(uri.absolute(schemeParser != null ? schemeParser.bind() : null,
                                 null, null, null, null));
      }
    }
    if (step == 4) {
      if (input.isCont() && input.head() == '/') {
        input = input.step();
        step = 5;
      } else if (input.isCont()) {
        final UriPathBuilder pathBuilder = uri.pathBuilder();
        pathBuilder.addSlash();
        pathParser = uri.parsePath(input, pathBuilder);
        step = 6;
      } else if (input.isDone()) {
        return done(uri.absolute(schemeParser != null ? schemeParser.bind() : null,
                                 null, UriPath.slash(), null, null));
      }
    }
    if (step == 5) {
      if (authorityParser == null) {
        authorityParser = uri.parseAuthority(input);
      } else {
        authorityParser = authorityParser.feed(input);
      }
      if (authorityParser.isDone()) {
        if (input.isCont()) {
          c = input.head();
          if (c == '?') {
            input = input.step();
            step = 7;
          } else if (c == '#') {
            input = input.step();
            step = 8;
          } else {
            step = 6;
          }
        } else if (input.isDone()) {
          return done(uri.absolute(schemeParser != null ? schemeParser.bind() : null,
                                   authorityParser.bind(), null, null, null));
        }
      } else if (authorityParser.isError()) {
        return authorityParser.asError();
      }
    }
    if (step == 6) {
      if (pathParser == null) {
        pathParser = uri.parsePath(input);
      } else {
        pathParser = pathParser.feed(input);
      }
      if (pathParser.isDone()) {
        if (input.isCont() && input.head() == '?') {
          input = input.step();
          step = 7;
        } else if (input.isCont() && input.head() == '#') {
          input = input.step();
          step = 8;
        } else if (!input.isEmpty()) {
          return done(uri.absolute(schemeParser != null ? schemeParser.bind() : null,
                                   authorityParser != null ? authorityParser.bind() : null,
                                   pathParser.bind(), null, null));
        }
      } else if (pathParser.isError()) {
        return pathParser.asError();
      }
    }
    if (step == 7) {
      if (queryParser == null) {
        queryParser = uri.parseQuery(input);
      } else {
        queryParser = queryParser.feed(input);
      }
      if (queryParser.isDone()) {
        if (input.isCont() && input.head() == '#') {
          input = input.step();
          step = 8;
        } else if (!input.isEmpty()) {
          return done(uri.absolute(schemeParser != null ? schemeParser.bind() : null,
                                   authorityParser != null ? authorityParser.bind() : null,
                                   pathParser != null ? pathParser.bind() : null,
                                   queryParser.bind(), null));
        }
      } else if (queryParser.isError()) {
        return queryParser.asError();
      }
    }
    if (step == 8) {
      if (fragmentParser == null) {
        fragmentParser = uri.parseFragment(input);
      } else {
        fragmentParser = fragmentParser.feed(input);
      }
      if (fragmentParser.isDone()) {
        return done(uri.absolute(schemeParser != null ? schemeParser.bind() : null,
                                 authorityParser != null ? authorityParser.bind() : null,
                                 pathParser != null ? pathParser.bind() : null,
                                 queryParser != null ? queryParser.bind() : null,
                                 fragmentParser.bind()));
      } else if (fragmentParser.isError()) {
        return fragmentParser.asError();
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new UriAbsoluteParser(uri, schemeParser, authorityParser, pathParser,
                                 queryParser, fragmentParser, step);
  }

  static Parser<Uri> parse(Input input, UriParser uri) {
    return parse(input, uri, null, null, null, null, null, 1);
  }
}
