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

package swim.recon;

import org.testng.annotations.Test;
import swim.structure.Attr;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Selector;
import swim.structure.Slot;
import static swim.recon.ReconParserSpec.assertParses;

public class ReconSelectorParserSpec {
  @Test
  public void parseGetSelector() {
    assertParses("$a", Selector.identity().get("a"));
    assertParses("$test", Selector.identity().get("test"));
    assertParses("$\"a b\"", Selector.identity().get("a b"));
    assertParses("$42", Selector.identity().get(Num.from(42)));
    assertParses("${{}}", Selector.identity().get(Record.empty()));
    assertParses("${1,2}", Selector.identity().get(Record.of(1, 2)));
    assertParses("${@test}", Selector.identity().get(Record.of(Attr.of("test"))));
  }

  @Test
  public void parseGetAttrSelector() {
    assertParses("$@test", Selector.identity().getAttr("test"));
  }

  @Test
  public void parseGetItemSelector() {
    assertParses("$#0", Selector.identity().getItem(0));
  }

  @Test
  public void parsePathSelector() {
    assertParses("$a.b", Selector.identity().get("a").get("b"));
    assertParses("$a.b.c", Selector.identity().get("a").get("b").get("c"));
    assertParses("$a.1", Selector.identity().get("a").get(Num.from(1)));
    assertParses("$a#1", Selector.identity().get("a").getItem(1));
    assertParses("$@foo.@bar", Selector.identity().getAttr("foo").getAttr("bar"));
    assertParses("${@foo}.{@bar}", Selector.identity().get(Record.of(Attr.of("foo"))).get(Record.of(Attr.of("bar"))));
  }

  @Test
  public void parseKeysSelector() {
    assertParses("$*:", Selector.identity().keys());
  }

  @Test
  public void parseValuesSelector() {
    assertParses("$:*", Selector.identity().values());
  }

  @Test
  public void parseChildrenSelector() {
    assertParses("$*", Selector.identity().children());
  }

  @Test
  public void parseDescendantsSelector() {
    assertParses("$**", Selector.identity().descendants());
  }

  @Test
  public void parseKeysGetSelector() {
    assertParses("$*:.a", Selector.identity().keys().get("a"));
  }

  @Test
  public void parseGetKeysSelector() {
    assertParses("$a.*:", Selector.identity().get("a").keys());
  }

  @Test
  public void parseValuesGetSelector() {
    assertParses("$:*.a", Selector.identity().values().get("a"));
  }

  @Test
  public void parseGetValuesSelector() {
    assertParses("$a.:*", Selector.identity().get("a").values());
  }

  @Test
  public void parseChildrenGetSelector() {
    assertParses("$*.a", Selector.identity().children().get("a"));
  }

  @Test
  public void parseGetChildrenSelector() {
    assertParses("$a.*", Selector.identity().get("a").children());
  }

  @Test
  public void parseDescendantsGetSelector() {
    assertParses("$**.a", Selector.identity().descendants().get("a"));
  }

  @Test
  public void parseGetDescendantsSelector() {
    assertParses("$a.**", Selector.identity().get("a").descendants());
  }

  @Test
  public void parseGetChildrenGetSelector() {
    assertParses("$a.*.b", Selector.identity().get("a").children().get("b"));
    assertParses("$a.*.b.*.c", Selector.identity().get("a").children().get("b").children().get("c"));
  }

  @Test
  public void parseGetDescendantsGetSelector() {
    assertParses("$a.**.b", Selector.identity().get("a").descendants().get("b"));
    assertParses("$a.**.b.**.c", Selector.identity().get("a").descendants().get("b").descendants().get("c"));
  }

  @Test
  public void parseKeysGetAttrSelector() {
    assertParses("$*:.@test", Selector.identity().keys().getAttr("test"));
  }

  @Test
  public void parseGetAttrKeysSelector() {
    assertParses("$@test.*:", Selector.identity().getAttr("test").keys());
  }

  @Test
  public void parseValuesGetAttrSelector() {
    assertParses("$:*.@test", Selector.identity().values().getAttr("test"));
  }

  @Test
  public void parseGetAttrValuesSelector() {
    assertParses("$@test.:*", Selector.identity().getAttr("test").values());
  }

  @Test
  public void parseChildrenGetAttrSelector() {
    assertParses("$*.@test", Selector.identity().children().getAttr("test"));
  }

  @Test
  public void parseGetAttrChildrenSelector() {
    assertParses("$@test.*", Selector.identity().getAttr("test").children());
  }

  @Test
  public void parseDescendantsGetAttrSelector() {
    assertParses("$**.@test", Selector.identity().descendants().getAttr("test"));
  }

  @Test
  public void parseGetAttrDescendantsSelector() {
    assertParses("$@test.**", Selector.identity().getAttr("test").descendants());
  }

  @Test
  public void parseKeysGetItemSelector() {
    assertParses("$*:#0", Selector.identity().keys().getItem(0));
  }

  @Test
  public void parseGetItemKeysSelector() {
    assertParses("$#0.*:", Selector.identity().getItem(0).keys());
  }

  @Test
  public void parseValuesGetItemSelector() {
    assertParses("$:*#0", Selector.identity().values().getItem(0));
  }

  @Test
  public void parseGetItemValuesSelector() {
    assertParses("$#0.:*", Selector.identity().getItem(0).values());
  }

  @Test
  public void parseChildrenGetItemSelector() {
    assertParses("$*#0", Selector.identity().children().getItem(0));
  }

  @Test
  public void parseGetItemChildrenSelector() {
    assertParses("$#0.*", Selector.identity().getItem(0).children());
  }

  @Test
  public void parseDescendantsGetItemSelector() {
    assertParses("$**#0", Selector.identity().descendants().getItem(0));
  }

  @Test
  public void parseGetItemDescendantsSelector() {
    assertParses("$#0.**", Selector.identity().getItem(0).descendants());
  }

  @Test
  public void parseFilter() {
    assertParses("$[$a]", Selector.identity().get("a").filter());
    assertParses("$[$1]", Selector.identity().get(Num.from(1)).filter());
    assertParses("$[$#1]", Selector.identity().getItem(1).filter());
    assertParses("$[$@test]", Selector.identity().getAttr("test").filter());
  }

  @Test
  public void parseGetFilter() {
    assertParses("$a[$b]", Selector.identity().get("a").filter(Selector.identity().get("b")));
  }

  @Test
  public void parseGetFilterGetSelector() {
    assertParses("$a[$b].c", Selector.identity().get("a").filter(Selector.identity().get("b")).get("c"));
  }

  @Test
  public void parseGetAttrFilter() {
    assertParses("$@foo[$b]", Selector.identity().getAttr("foo").filter(Selector.identity().get("b")));
  }

  @Test
  public void parseGetAttrFilterGetAttrSelector() {
    assertParses("$@foo[$b].@bar", Selector.identity().getAttr("foo").filter(Selector.identity().get("b")).getAttr("bar"));
  }

  @Test
  public void parseGetItemFilter() {
    assertParses("$#0[$b]", Selector.identity().getItem(0).filter(Selector.identity().get("b")));
  }

  @Test
  public void parseGetItemFilterGetItemSelector() {
    assertParses("$#0[$b]#1", Selector.identity().getItem(0).filter(Selector.identity().get("b")).getItem(1));
  }

  @Test
  public void parseKeysFilter() {
    assertParses("$*:[$a]", Selector.identity().keys().filter(Selector.identity().get("a")));
  }

  @Test
  public void parseValuesFilter() {
    assertParses("$:*[$a]", Selector.identity().values().filter(Selector.identity().get("a")));
  }

  @Test
  public void parseChildrenFilter() {
    assertParses("$*[$a]", Selector.identity().children().filter(Selector.identity().get("a")));
  }

  @Test
  public void parseDescendantsFilter() {
    assertParses("$**[$a]", Selector.identity().descendants().filter(Selector.identity().get("a")));
  }

  @Test
  public void parseRecordsWithSelectors() {
    assertParses("{a: $foo, b: $bar}", Record.of(Slot.of("a", Selector.identity().get("foo")), Slot.of("b", Selector.identity().get("bar"))));
  }
}
