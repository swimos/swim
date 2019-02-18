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
import static swim.recon.ReconWriterSpec.assertWrites;

public class ReconSelectorWriterSpec {
  @Test
  public void writeIdentitySelector() {
    assertWrites(Selector.identity(), "");
  }

  @Test
  public void writeGetSelector() {
    assertWrites(Selector.identity().get("a"), "$a");
    assertWrites(Selector.identity().get("test"), "$test");
    assertWrites(Selector.identity().get("a b"), "$\"a b\"");
    assertWrites(Selector.identity().get(Num.from(42)), "$42");
    assertWrites(Selector.identity().get(Record.empty()), "${{}}");
    assertWrites(Selector.identity().get(Record.of(1, 2)), "${1,2}");
    assertWrites(Selector.identity().get(Record.of(Attr.of("test"))), "${@test}");
  }
  @Test
  public void writeGetAttrSelector() {
    assertWrites(Selector.identity().getAttr("test"), "$@test");
  }

  @Test
  public void writeGetItemSelector() {
    assertWrites(Selector.identity().getItem(0), "$#0");
  }

  @Test
  public void writePathSelector() {
    assertWrites(Selector.identity().get("a").get("b"), "$a.b");
    assertWrites(Selector.identity().get("a").get("b").get("c"), "$a.b.c");
    assertWrites(Selector.identity().get("a").get(Num.from(1)), "$a.1");
    assertWrites(Selector.identity().get("a").getItem(1), "$a#1");
    assertWrites(Selector.identity().getAttr("foo").getAttr("bar"), "$@foo.@bar");
    assertWrites(Selector.identity().get(Record.of(Attr.of("foo"))).get(Record.of(Attr.of("bar"))), "${@foo}.{@bar}");
  }

  @Test
  public void writeKeysSelector() {
    assertWrites(Selector.identity().keys(), "$*:");
  }

  @Test
  public void writeValuesSelector() {
    assertWrites(Selector.identity().values(), "$:*");
  }

  @Test
  public void writeChildrenSelector() {
    assertWrites(Selector.identity().children(), "$*");
  }

  @Test
  public void writeDescendantsSelector() {
    assertWrites(Selector.identity().descendants(), "$**");
  }

  @Test
  public void writeKeysGetSelector() {
    assertWrites(Selector.identity().keys().get("a"), "$*:.a");
  }

  @Test
  public void writeGetKeysSelector() {
    assertWrites(Selector.identity().get("a").keys(), "$a.*:");
  }

  @Test
  public void writeValuesGetSelector() {
    assertWrites(Selector.identity().values().get("a"), "$:*.a");
  }

  @Test
  public void writeGetValuesSelector() {
    assertWrites(Selector.identity().get("a").values(), "$a.:*");
  }

  @Test
  public void writeChildrenGetSelector() {
    assertWrites(Selector.identity().children().get("a"), "$*.a");
  }

  @Test
  public void writeGetChildrenSelector() {
    assertWrites(Selector.identity().get("a").children(), "$a.*");
  }

  @Test
  public void writeDescendantsGetSelector() {
    assertWrites(Selector.identity().descendants().get("a"), "$**.a");
  }

  @Test
  public void writeGetDescendantsSelector() {
    assertWrites(Selector.identity().get("a").descendants(), "$a.**");
  }

  @Test
  public void writeGetChildrenGetSelector() {
    assertWrites(Selector.identity().get("a").children().get("b"), "$a.*.b");
    assertWrites(Selector.identity().get("a").children().get("b").children().get("c"), "$a.*.b.*.c");
  }

  @Test
  public void writeGetDescendantsGetSelector() {
    assertWrites(Selector.identity().get("a").descendants().get("b"), "$a.**.b");
    assertWrites(Selector.identity().get("a").descendants().get("b").descendants().get("c"), "$a.**.b.**.c");
  }

  @Test
  public void writeKeysGetAttrSelector() {
    assertWrites(Selector.identity().keys().getAttr("test"), "$*:.@test");
  }

  @Test
  public void writeGetAttrKeysSelector() {
    assertWrites(Selector.identity().getAttr("test").keys(), "$@test.*:");
  }

  @Test
  public void writeValuesGetAttrSelector() {
    assertWrites(Selector.identity().values().getAttr("test"), "$:*.@test");
  }

  @Test
  public void writeGetAttrValuesSelector() {
    assertWrites(Selector.identity().getAttr("test").values(), "$@test.:*");
  }

  @Test
  public void writeChildrenGetAttrSelector() {
    assertWrites(Selector.identity().children().getAttr("test"), "$*.@test");
  }

  @Test
  public void writeGetAttrChildrenSelector() {
    assertWrites(Selector.identity().getAttr("test").children(), "$@test.*");
  }

  @Test
  public void writeDescendantsGetAttrSelector() {
    assertWrites(Selector.identity().descendants().getAttr("test"), "$**.@test");
  }

  @Test
  public void writeGetAttrDescendantsSelector() {
    assertWrites(Selector.identity().getAttr("test").descendants(), "$@test.**");
  }

  @Test
  public void writeKeysGetItemSelector() {
    assertWrites(Selector.identity().keys().getItem(0), "$*:#0");
  }

  @Test
  public void writeGetItemKeysSelector() {
    assertWrites(Selector.identity().getItem(0).keys(), "$#0.*:");
  }

  @Test
  public void writeValuesGetItemSelector() {
    assertWrites(Selector.identity().values().getItem(0), "$:*#0");
  }

  @Test
  public void writeGetItemValuesSelector() {
    assertWrites(Selector.identity().getItem(0).values(), "$#0.:*");
  }

  @Test
  public void writeChildrenGetItemSelector() {
    assertWrites(Selector.identity().children().getItem(0), "$*#0");
  }

  @Test
  public void writeGetItemChildrenSelector() {
    assertWrites(Selector.identity().getItem(0).children(), "$#0.*");
  }

  @Test
  public void writeDescendantsGetItemSelector() {
    assertWrites(Selector.identity().descendants().getItem(0), "$**#0");
  }

  @Test
  public void writeGetItemDescendantsSelector() {
    assertWrites(Selector.identity().getItem(0).descendants(), "$#0.**");
  }

  @Test
  public void writeFilter() {
    assertWrites(Selector.identity().get("a").filter(), "$[$a]");
    assertWrites(Selector.identity().get(Num.from(1)).filter(), "$[$1]");
    assertWrites(Selector.identity().getItem(1).filter(), "$[$#1]");
    assertWrites(Selector.identity().getAttr("test").filter(), "$[$@test]");
  }

  @Test
  public void writeGetFilter() {
    assertWrites(Selector.identity().get("a").filter(Selector.identity().get("b")), "$a[$b]");
  }

  @Test
  public void writeGetFilterGetSelector() {
    assertWrites(Selector.identity().get("a").filter(Selector.identity().get("b")).get("c"), "$a[$b].c");
  }

  @Test
  public void writeGetAttrFilter() {
    assertWrites(Selector.identity().getAttr("foo").filter(Selector.identity().get("b")), "$@foo[$b]");
  }

  @Test
  public void writeGetAttrFilterGetAttrSelector() {
    assertWrites(Selector.identity().getAttr("foo").filter(Selector.identity().get("b")).getAttr("bar"), "$@foo[$b].@bar");
  }

  @Test
  public void writeGetItemFilter() {
    assertWrites(Selector.identity().getItem(0).filter(Selector.identity().get("b")), "$#0[$b]");
  }

  @Test
  public void writeGetItemFilterGetItemSelector() {
    assertWrites(Selector.identity().getItem(0).filter(Selector.identity().get("b")).getItem(1), "$#0[$b]#1");
  }

  @Test
  public void writeKeysFilter() {
    assertWrites(Selector.identity().keys().filter(Selector.identity().get("a")), "$*:[$a]");
  }

  @Test
  public void writeValuesFilter() {
    assertWrites(Selector.identity().values().filter(Selector.identity().get("a")), "$:*[$a]");
  }

  @Test
  public void writeChildrenFilter() {
    assertWrites(Selector.identity().children().filter(Selector.identity().get("a")), "$*[$a]");
  }

  @Test
  public void writeDescendantsFilter() {
    assertWrites(Selector.identity().descendants().filter(Selector.identity().get("a")), "$**[$a]");
  }

  @Test
  public void writeRecordsWithSelectors() {
    assertWrites(Record.of(Slot.of("a", Selector.identity().get("foo")), Slot.of("b", Selector.identity().get("bar"))), "{a:$foo,b:$bar}");
  }
}
