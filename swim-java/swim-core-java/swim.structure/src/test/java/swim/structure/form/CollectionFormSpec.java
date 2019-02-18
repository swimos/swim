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

package swim.structure.form;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.SortedSet;
import java.util.TreeSet;
import org.testng.annotations.Test;
import swim.structure.Form;
import swim.structure.Num;
import swim.structure.Record;
import static org.testng.Assert.assertEquals;

public class CollectionFormSpec {
  @Test
  public void moldSet() {
    final HashSet<Integer> set = new HashSet<>();
    set.add(1);
    set.add(2);
    set.add(3);
    assertEquals(Form.forSet(Form.forInteger()).mold(set), Record.of(1, 2, 3));
  }

  @Test
  public void castRecordToSet() {
    final HashSet<Integer> integerSet = new HashSet<>();
    integerSet.add(1);
    integerSet.add(2);
    integerSet.add(3);
    assertEquals(Form.forSet(Form.forInteger()).cast(Record.of(1, "2", 3)), integerSet);
    assertEquals(Form.forSet(Form.forInteger()).cast(Record.of(1, "2", "true", 3)), integerSet);

    final HashSet<Double> doubleSet = new HashSet<>();
    doubleSet.add(1.0);
    doubleSet.add(2.0);
    doubleSet.add(3.0);
    assertEquals(Form.forSet(Form.forDouble()).cast(Record.of(1, "2", 3)), doubleSet);
    assertEquals(Form.forSet(Form.forDouble()).cast(Record.of(1, "2", "true", 3)), doubleSet);

    final HashSet<String> stringSet = new HashSet<>();
    stringSet.add("1");
    stringSet.add("2");
    stringSet.add("3");
    assertEquals(Form.forSet(Form.forString()).cast(Record.of(1, "2", 3)), stringSet);
  }

  @Test
  public void castValueToUnarySet() {
    assertEquals(Form.forSet(Form.forInteger()).cast(Num.from(1)), Collections.singleton(1));
  }

  @Test
  public void castRecordToSortedSet() {
    final SortedSet<Integer> integerSet = new TreeSet<>();
    integerSet.add(1);
    integerSet.add(2);
    integerSet.add(3);
    final Form<SortedSet<Integer>> myForm = Form.forCollection(SortedSet.class, Form.forInteger());
    assertEquals(myForm.cast(Record.of("3", "02", "1")), integerSet);
    assertEquals(Form.forSet(Form.forInteger()).cast(Record.of(3, "true", "02", 1)), integerSet);

    final SortedSet<Double> doubleSet = new TreeSet<>();
    doubleSet.add(1.0);
    doubleSet.add(2.0);
    doubleSet.add(3.0);
    assertEquals(Form.forSet(Form.forDouble()).cast(Record.of(1, "2", 3)), doubleSet);
    assertEquals(Form.forSet(Form.forDouble()).cast(Record.of(1, "2", "true", 3)), doubleSet);

    final SortedSet<String> stringSet = new TreeSet<>();
    stringSet.add("1");
    stringSet.add("20");
    stringSet.add("3");
    assertEquals(Form.forSet(Form.forString()).cast(Record.of(1, "20", 3)), stringSet);
  }

  @Test
  public void moldMap() {
    final HashMap<String, Integer> map = new HashMap<>();
    map.put("a", 1);
    map.put("b", 2);
    map.put("c", 3);
    final Record record = (Record) Form.forMap(Form.forString(), Form.forInteger()).mold(map);
    assertEquals(record.size(), 3);
    assertEquals(record.get("a"), Num.from(1));
    assertEquals(record.get("b"), Num.from(2));
    assertEquals(record.get("c"), Num.from(3));
  }

  @Test
  public void castRecordToMap() {
    final HashMap<String, Integer> integerMap = new HashMap<>();
    integerMap.put("a", 1);
    integerMap.put("b", 2);
    integerMap.put("c", 3);
    assertEquals(Form.forMap(Form.forString(), Form.forInteger()).cast(Record.of().slot("a", 1).slot("b", "2").slot("c", 3)), integerMap);
    assertEquals(Form.forMap(Form.forString(), Form.forInteger()).cast(Record.of().slot("a", 1).slot("b", "2").item("true").slot("c", 3)), integerMap);

    final HashMap<String, Double> doubleMap = new HashMap<>();
    doubleMap.put("a", 1.0);
    doubleMap.put("b", 2.0);
    doubleMap.put("c", 3.0);
    assertEquals(Form.forMap(Form.forString(), Form.forDouble()).cast(Record.of().slot("a", 1).slot("b", "2").slot("c", 3)), doubleMap);
    assertEquals(Form.forMap(Form.forString(), Form.forDouble()).cast(Record.of().slot("a", 1).slot("b", "2").item("true").slot("c", 3)), doubleMap);

    final HashMap<String, String> stringMap = new HashMap<>();
    stringMap.put("a", "1");
    stringMap.put("b", "2");
    stringMap.put("c", "3");
    assertEquals(Form.forMap(Form.forString(), Form.forString()).cast(Record.of().slot("a", 1).slot("b", "2").slot("c", 3)), stringMap);
  }
}
