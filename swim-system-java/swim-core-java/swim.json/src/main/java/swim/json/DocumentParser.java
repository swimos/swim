package swim.json;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.util.Builder;

final class DocumentParser<I, V> extends Parser<V> {

  final JsonParser<I, V> json;
  final Builder<I, V> builder;
  final Parser<V> keyParser;
  final Parser<V> valueParser;
  final int step;

  DocumentParser(JsonParser<I, V> json, Builder<I, V> builder,
                 Parser<V> keyParser, Parser<V> valueParser, int step) {
    this.json = json;
    this.builder = builder;
    this.keyParser = keyParser;
    this.valueParser = valueParser;
    this.step = step;
  }

  DocumentParser(JsonParser<I, V> json) {
    this(json, null, null, null, 1);
  }

  @Override
  public Parser<V> feed(Input input) {
    return DocumentParser.parse(input, this.json, this.builder,
                                this.keyParser, this.valueParser, this.step);
  }

  static <I, V> Parser<V> parse(Input input, JsonParser<I, V> json, Builder<I, V> builder,
                                Parser<V> keyParser, Parser<V> valueParser, int step) {
    int c = 0;
    if (step == 1) {
      while (input.isCont()) {
        c = input.head();
        if (Json.isWhitespace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (c == '{') {
          input = input.step();
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected('{', input));
        }
      } else if (input.isError()) {
        return Parser.error(input.trap());
      } else if (input.isDone()) {
        // or return error?
        //return Parser.error(Diagnostic.expected('{', input));
        if (builder == null) {
          builder = json.documentBuilder();
        }
        return Parser.done(builder.bind());
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Json.isWhitespace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (builder == null) {
          builder = json.documentBuilder();
        }
        if (c == '}') {
          input = input.step();
          return Parser.done(builder.bind());
        } else {
          step = 3;
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected('}', input));
      }
    }
    while (step >= 3 && !input.isEmpty()) {
      if (step == 3) {
        if (keyParser == null) {
          keyParser = json.parseString(input);
        }
        while (keyParser.isCont() && !input.isEmpty()) {
          keyParser = keyParser.feed(input);
        }
        if (keyParser.isDone()) {
          step = 4;
        } else if (keyParser.isError()) {
          return keyParser;
        } else {
          break;
        }
      }
      if (step == 4) {
        while (input.isCont()) {
          c = input.head();
          if (Json.isWhitespace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == ':') {
            input = input.step();
            step = 5;
          } else {
            return Parser.error(Diagnostic.expected(':', input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected(':', input));
        } else {
          break;
        }
      }
      if (step == 5) {
        while (input.isCont() && Json.isWhitespace(input.head())) {
          input = input.step();
        }
        if (input.isCont()) {
          step = 6;
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("value", input));
        } else {
          break;
        }
      }
      if (step == 6) {
        if (valueParser == null) {
          valueParser = json.parseValue(input);
        }
        while (valueParser.isCont() && !input.isEmpty()) {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          builder.add(json.field(keyParser.bind(), valueParser.bind()));
          keyParser = null;
          valueParser = null;
          step = 7;
        } else if (valueParser.isError()) {
          return valueParser;
        } else {
          break;
        }
      }
      if (step == 7) {
        while (input.isCont()) {
          c = input.head();
          if (Json.isWhitespace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == ',') {
            input = input.step();
            step = 3;
          } else if (c == '}') {
            input = input.step();
            step = 8;
          } else {
            return Parser.error(Diagnostic.expected("',' or '}'", input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected('}', input));
        } else {
          break;
        }
      }
      if (step == 8) {
        while (input.isCont()) {
          c = input.head();
          if (Json.isWhitespace(c)) {
            input = input.step();
          } else {
            return Parser.error(Diagnostic.unexpected(input, "trailing characters after closing '}'"));
          }
        }
        return Parser.done(builder.bind());
      }
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new DocumentParser<I, V>(json, builder, keyParser, valueParser, step);
  }

  static <I, V> Parser<V> parse(Input input, JsonParser<I, V> json) {
    return DocumentParser.parse(input, json, null, null, null, 1);
  }

}
