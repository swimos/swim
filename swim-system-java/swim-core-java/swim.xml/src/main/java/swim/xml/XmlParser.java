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

package swim.xml;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.util.Builder;

/**
 * Factory for constructing XML parsers and parse trees.
 */
public abstract class XmlParser<I, V> {
  public abstract I item(V value);

  public abstract String name(String name);

  public abstract I attribute(String name, V value);

  public abstract V attributes();

  public abstract I xml(V attributes);

  public abstract I doctype(String name);

  public abstract I doctype(String name, String systemId);

  public abstract I doctype(String name, String publicId, String systemId);

  public abstract I tag(String name);

  public abstract I tag(String name, V attributes);

  public abstract I comment(String value);

  public abstract I pi(String target, String value);

  public abstract Output<String> nameOutput();

  public abstract Output<V> textOutput();

  public Output<I> commentOutput() {
    return new CommentOutput<I>(this);
  }

  public Output<I> piOutput(String target) {
    return new PIOutput<I>(this, target);
  }

  public abstract Builder<I, V> attributesBuilder();

  public abstract Builder<I, V> tagBuilder(String tag);

  public abstract Builder<I, V> tagBuilder(String tag, V attributes);

  public abstract Builder<I, V> documentBuilder();

  public abstract Builder<I, V> fragmentBuilder();

  public boolean expandEntityRef(String name, Output<?> output) {
    if ("amp".equals(name)) {
      output = output.write('&');
      return true;
    } else if ("lt".equals(name)) {
      output = output.write('<');
      return true;
    } else if ("gt".equals(name)) {
      output = output.write('>');
      return true;
    } else if ("apos".equals(name)) {
      output = output.write('\'');
      return true;
    } else if ("quot".equals(name)) {
      output = output.write('"');
      return true;
    }
    return false;
  }

  public Parser<String> parseName(Input input) {
    return NameParser.parse(input, this);
  }

  public Parser<V> parseAttributeValue(Input input) {
    return AttributeValueParser.parse(input, this);
  }

  public Parser<String> parseEntityName(Input input) {
    return NameParser.parse(input, this);
  }

  public Parser<?> parseReference(Input input, Output<?> text) {
    return ReferenceParser.parse(input, this, text);
  }

  public Parser<V> parseDocument(Input input) {
    return DocumentParser.parse(input, this);
  }

  public Parser<V> parseFragment(Input input) {
    return DocumentParser.parse(input, this, fragmentBuilder());
  }

  public Parser<I> parseXmlDecl(Input input) {
    return XmlDeclParser.parse(input, this);
  }

  public Parser<I> parseXmlDeclRest(Input input) {
    return XmlDeclParser.parseRest(input, this);
  }

  public Parser<I> parseDoctypeDecl(Input input) {
    return DoctypeDeclParser.parse(input, this);
  }

  public Parser<I> parseDoctypeDeclRest(Input input) {
    return DoctypeDeclParser.parseRest(input, this);
  }

  public Parser<V> parseMarkupDecl(Input input) {
    // TODO: MarkupDeclParser.parse(input, this);
    return Parser.error(Diagnostic.message("unsupported markup decl", input));
  }

  public Parser<V> parseTagStart(Input input) {
    return TagStartParser.parse(input, this);
  }

  public Parser<V> parseTagStartRest(Input input) {
    return TagStartParser.parseRest(input, this);
  }

  public Parser<V> parseTagStartRest(Input input, Builder<I, V> builder) {
    return TagStartParser.parseRest(input, this, builder);
  }

  public Parser<V> parseTagContent(Input input, String tag, Builder<I, V> builder) {
    return TagContentParser.parse(input, this, tag, builder);
  }

  public Parser<V> parseTagEnd(Input input, String tag, Builder<I, V> builder) {
    return TagEndParser.parse(input, this, tag, builder);
  }

  public Parser<V> parseTagEndRest(Input input, String tag, Builder<I, V> builder) {
    return TagEndParser.parseRest(input, this, tag, builder);
  }

  public Parser<?> parseCDataSection(Input input, Output<?> text) {
    return CDataSectionParser.parse(input, this, text);
  }

  public Parser<?> parseCDataSectionRest(Input input, Output<?> text) {
    return CDataSectionParser.parseRest(input, this, text);
  }

  public Parser<I> parseComment(Input input) {
    return CommentParser.parse(input, this);
  }

  public Parser<I> parseCommentRest(Input input) {
    return CommentParser.parseRest(input, this);
  }

  public Parser<I> parsePI(Input input) {
    return PIParser.parse(input, this);
  }

  public Parser<I> parsePIRest(Input input) {
    return PIParser.parseRest(input, this);
  }

  public Parser<String> parsePITarget(Input input) {
    return NameParser.parse(input, this);
  }

  public Parser<I> parsePITargetRest(Input input, String target) {
    return PIParser.parseTargetRest(input, this, target);
  }

  public Parser<V> documentParser() {
    return new DocumentParser<I, V>(this);
  }

  public V parseDocumentString(String string) {
    Input input = Unicode.stringInput(string);
    while (input.isCont() && Xml.isWhitespace(input.head())) {
      input = input.step();
    }
    Parser<V> parser = parseDocument(input);
    if (parser.isDone()) {
      while (input.isCont() && Xml.isWhitespace(input.head())) {
        input = input.step();
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }

  public V parseFragmentString(String string) {
    Input input = Unicode.stringInput(string);
    while (input.isCont() && Xml.isWhitespace(input.head())) {
      input = input.step();
    }
    Parser<V> parser = parseFragment(input);
    if (parser.isDone()) {
      while (input.isCont() && Xml.isWhitespace(input.head())) {
        input = input.step();
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }
}
