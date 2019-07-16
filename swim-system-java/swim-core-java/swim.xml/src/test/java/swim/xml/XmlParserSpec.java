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

import org.testng.annotations.Test;
import swim.codec.ParserException;
import swim.structure.Attr;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import static org.testng.Assert.ThrowingRunnable;
import static org.testng.Assert.assertThrows;

public class XmlParserSpec {
  public static void assertParses(String xml, Value expected) {
    Assertions.assertParses(Xml.structureParser().documentParser(), xml, expected);
    Assertions.assertParses(Xml.structureParser().documentParser(), " " + xml + " ", expected);
  }

  public static void assertParseFails(final String xml) {
    assertThrows(ParserException.class, new ThrowingRunnable() {
      @Override
      public void run() throws Throwable {
        Xml.parse(xml);
      }
    });
  }

  @Test
  public void parseEmptyTags() {
    assertParses("<test/>", Record.of(Attr.of("test")));
    assertParses("<test />", Record.of(Attr.of("test")));
    assertParses("<test\n  />", Record.of(Attr.of("test")));
  }

  @Test
  public void parseEmptyTagsWithSingleAttribute() {
    assertParses("<test foo=\"bar\"/>",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", "bar")))));
    assertParses("<test  foo=\"bar\" />",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", "bar")))));
    assertParses("<test\n  foo=\"bar\"\n  />",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", "bar")))));
  }

  @Test
  public void parseEmptyTagsWithMultipleAttributes() {
    assertParses("<test foo=\"bar\" baz=\"qux\"/>",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", "bar"), Slot.of("baz", "qux")))));
    assertParses("<test  foo=\"bar\"  baz=\"qux\" />",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", "bar"), Slot.of("baz", "qux")))));
    assertParses("<test\n  foo=\"bar\"\n  baz=\"qux\"\n  />",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", "bar"), Slot.of("baz", "qux")))));
  }

  @Test
  public void parseTags() {
    assertParses("<test></test>", Record.of(Attr.of("test")));
    assertParses("<test ></test >", Record.of(Attr.of("test")));
    assertParses("<test\n  ></test\n  >", Record.of(Attr.of("test")));
  }

  @Test
  public void parseTagsWithSingleAttribute() {
    assertParses("<test foo=\"bar\"></test>",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", "bar")))));
    assertParses("<test  foo=\"bar\" ></test>",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", "bar")))));
    assertParses("<test\n  foo=\"bar\"\n  ></test>",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", "bar")))));
  }

  @Test
  public void parseTagsWithMultipleAttributes() {
    assertParses("<test foo=\"bar\" baz=\"qux\"></test>",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", "bar"), Slot.of("baz", "qux")))));
    assertParses("<test  foo=\"bar\"  baz=\"qux\" ></test>",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", "bar"), Slot.of("baz", "qux")))));
    assertParses("<test\n  foo=\"bar\"\n  baz=\"qux\"\n  ></test>",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", "bar"), Slot.of("baz", "qux")))));
  }

  @Test
  public void parseTagAttributesWithDecimalCharRefs() {
    assertParses("<test foo=\"&#32;\"/>",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", " ")))));
    assertParses("<test foo=\"Hello,&#32;world!\"/>",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", "Hello, world!")))));
  }

  @Test
  public void parseTagAttributesWithHexadecimalCharRefs() {
    assertParses("<test foo=\"&#x20;\"/>",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", " ")))));
    assertParses("<test foo=\"Hello,&#x20;world!\"/>",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", "Hello, world!")))));
  }

  @Test
  public void parseTagAttributesWithBuiltinEntityRefs() {
    assertParses("<test foo=\"&amp;\"/>",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", "&")))));
    assertParses("<test foo=\"X&amp;Y\"/>",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", "X&Y")))));
    assertParses("<test foo=\"&amp;&lt;&gt;&apos;&quot;\"/>",
                 Record.of(Attr.of("test", Record.of(Slot.of("foo", "&<>'\"")))));
  }

  @Test
  public void parseTagsWithTextContent() {
    assertParses("<test>Hello, world!</test>", Record.of(Attr.of("test"), "Hello, world!"));
  }

  @Test
  public void parseTagContentWithDecimalCharRefs() {
    assertParses("<test>&#32;</test>", Record.of(Attr.of("test"), " "));
    assertParses("<test>Hello,&#32;world!</test>", Record.of(Attr.of("test"), "Hello, world!"));
  }

  @Test
  public void parseTagContentWithHexadecimalCharRefs() {
    assertParses("<test>&#x20;</test>", Record.of(Attr.of("test"), " "));
    assertParses("<test>Hello,&#x20;world!</test>", Record.of(Attr.of("test"), "Hello, world!"));
  }

  @Test
  public void parseTagContentWithBuiltinEntityRefs() {
    assertParses("<test>&amp;</test>", Record.of(Attr.of("test"), "&"));
    assertParses("<test>X&amp;Y</test>", Record.of(Attr.of("test"), "X&Y"));
    assertParses("<test>&amp;&lt;&gt;&apos;&quot;</test>", Record.of(Attr.of("test"), "&<>'\""));
  }

  @Test
  public void parseTagsWithCDATAContent() {
    assertParses("<test><![CDATA[]]></test>", Record.of(Attr.of("test"), ""));
    assertParses("<test><![CDATA[Hello, world!]]></test>", Record.of(Attr.of("test"), "Hello, world!"));
    assertParses("<test><![CDATA[<![CDATA[]]></test>", Record.of(Attr.of("test"), "<![CDATA["));
    assertParses("<test><![CDATA[]]]]></test>", Record.of(Attr.of("test"), "]]"));
    assertParses("<test><![CDATA[]]<>&;]]></test>", Record.of(Attr.of("test"), "]]<>&;"));
  }

  @Test
  public void parseTagsWithCommentContent() {
    assertParses("<test><!-- --></test>", Record.of(Attr.of("test"), Attr.of("xml:comment", " ")));
    assertParses("<test><!------></test>", Record.of(Attr.of("test"), Attr.of("xml:comment", "--")));
    assertParses("<test><!--X-Y--></test>", Record.of(Attr.of("test"), Attr.of("xml:comment", "X-Y")));
    assertParses("<test><!--X--Y--></test>", Record.of(Attr.of("test"), Attr.of("xml:comment", "X--Y")));
    assertParses("<test><!--<!--!--></test>", Record.of(Attr.of("test"), Attr.of("xml:comment", "<!--!")));
  }

  @Test
  public void parseTagsWithPIContent() {
    assertParses("<test><?cmd arg?></test>",
                 Record.of(Attr.of("test"), Attr.of("xml:pi", Record.of("cmd", "arg"))));
    assertParses("<test><?cmd <??></test>",
                 Record.of(Attr.of("test"), Attr.of("xml:pi", Record.of("cmd", "<?"))));
  }

  @Test
  public void parseTagContentWithSingleEmptyTag() {
    assertParses("<foo><bar/></foo>", Record.of(Attr.of("foo"), Record.of(Attr.of("bar"))));
  }

  @Test
  public void parseTagContentWithMultipleEmptyTags() {
    assertParses("<foo><bar/><baz/></foo>",
                 Record.of(Attr.of("foo"), Record.of(Attr.of("bar")), Record.of(Attr.of("baz"))));
  }

  @Test
  public void parseTagContentWithSingleTag() {
    assertParses("<foo><bar></bar></foo>", Record.of(Attr.of("foo"), Record.of(Attr.of("bar"))));
  }

  @Test
  public void parseTagContentWithMultipleTags() {
    assertParses("<foo><bar></bar><baz></baz></foo>",
                 Record.of(Attr.of("foo"), Record.of(Attr.of("bar")), Record.of(Attr.of("baz"))));
  }

  @Test
  public void parseDocumentsWithXmlDecl() {
    assertParses("<?xml version=\"1.0\"?><test/>",
                 Record.of(Attr.of("xml", Record.of(Slot.of("version", "1.0"))),
                           Attr.of("test")));
    assertParses("<?xml version=\"1.0\" encoding=\"UTF-8\"?><test/>",
                 Record.of(Attr.of("xml", Record.of(Slot.of("version", "1.0"), Slot.of("encoding", "UTF-8"))),
                           Attr.of("test")));
    assertParses("<?xml\nversion=\"1.0\"\nstandalone=\"yes\"\n?><test/>",
                 Record.of(Attr.of("xml", Record.of(Slot.of("version", "1.0"), Slot.of("standalone", "yes"))),
                           Attr.of("test")));
  }

  @Test
  public void parseDocumentsWithMiscNodes() {
    assertParses("<!-- begin -->\n"
               + "<?check true?>\n"
               + "<test/>\n"
               + "<!-- end -->\n"
               + "<?print stdout?>\n",
                 Record.of(Attr.of("xml:comment", " begin "),
                           Attr.of("xml:pi", Record.of("check", "true")),
                           Attr.of("test"),
                           Attr.of("xml:comment", " end "),
                           Attr.of("xml:pi", Record.of("print", "stdout"))));
  }

  @Test
  public void parseDocumentsWithXmlDeclAndMiscNodes() {
    assertParses("<?xml version=\"1.0\"?>\n"
               + "<!-- begin -->\n"
               + "<?check true?>\n"
               + "<test/>\n"
               + "<!-- end -->\n"
               + "<?print stdout?>\n",
                 Record.of(Attr.of("xml", Record.of(Slot.of("version", "1.0"))),
                           Attr.of("xml:comment", " begin "),
                           Attr.of("xml:pi", Record.of("check", "true")),
                           Attr.of("test"),
                           Attr.of("xml:comment", " end "),
                           Attr.of("xml:pi", Record.of("print", "stdout"))));
  }

  @Test
  public void parseDocumentsWithDoctypeDecl() {
    assertParses("<!DOCTYPE html><test/>",
                 Record.of(Attr.of("xml:doctype", "html"), Attr.of("test")));
    assertParses("<!DOCTYPE\nhtml\n><test/>",
                 Record.of(Attr.of("xml:doctype", "html"), Attr.of("test")));
  }

  @Test
  public void parseDoctypeDeclWithSystemId() {
    assertParses("<!DOCTYPE greeting SYSTEM \"hello.dtd\"><test/>",
                 Record.of(Attr.of("xml:doctype", Record.of(Slot.of("name", "greeting"),
                                                            Slot.of("system", "hello.dtd"))),
                           Attr.of("test")));
    assertParses("<!DOCTYPE\ngreeting\nSYSTEM\n\"hello.dtd\"\n>\n<test/>",
                 Record.of(Attr.of("xml:doctype", Record.of(Slot.of("name", "greeting"),
                                                            Slot.of("system", "hello.dtd"))),
                           Attr.of("test")));
  }

  @Test
  public void parseDoctypeDeclWithPublicId() {
    assertParses("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" "
                                     + "\"http://www.w3.org/TR/html4/strict.dtd\">"
               + "<test/>",
                 Record.of(Attr.of("xml:doctype",
                                   Record.of(Slot.of("name", "HTML"),
                                             Slot.of("public", "-//W3C//DTD HTML 4.01//EN"),
                                             Slot.of("system", "http://www.w3.org/TR/html4/strict.dtd"))),
                           Attr.of("test")));
    assertParses("<!DOCTYPE\nHTML\nPUBLIC\n\"-//W3C//DTD HTML 4.01//EN\"\n"
                                        + "\"http://www.w3.org/TR/html4/strict.dtd\"\n>\n"
               + "<test/>",
                 Record.of(Attr.of("xml:doctype",
                                   Record.of(Slot.of("name", "HTML"),
                                             Slot.of("public", "-//W3C//DTD HTML 4.01//EN"),
                                             Slot.of("system", "http://www.w3.org/TR/html4/strict.dtd"))),
                           Attr.of("test")));
  }
}
