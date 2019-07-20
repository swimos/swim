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

package swim.runtime;

import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriPattern;
import swim.util.Murmur3;

public abstract class PartPredicate {
  protected PartPredicate() {
    // stub
  }

  public abstract boolean test(Uri nodeUri, int nodeHash);

  public boolean test(Uri nodeUri) {
    return test(nodeUri, nodeUri.hashCode());
  }

  public PartPredicate and(PartPredicate that) {
    return new AndPartPredicate(this, that);
  }

  public abstract Value toValue();

  private static Form<PartPredicate> form;

  @Kind
  public static Form<PartPredicate> form() {
    if (form == null) {
      form = new PartPredicateForm();
    }
    return form;
  }

  private static PartPredicate any;

  public static PartPredicate any() {
    if (any == null) {
      any = new AnyPartPredicate();
    }
    return any;
  }

  public static PartPredicate and(PartPredicate... predicates) {
    return new AndPartPredicate(predicates);
  }

  public static PartPredicate node(UriPattern nodePattern) {
    return new NodePartPredicate(nodePattern);
  }

  public static PartPredicate node(String nodePattern) {
    return new NodePartPredicate(UriPattern.parse(nodePattern));
  }

  public static PartPredicate hash(int lowerBound, int upperBound) {
    return new HashPartPredicate(lowerBound, upperBound);
  }

  public static PartPredicate fromValue(Value value) {
    final String tag = value.tag();
    if ("node".equals(tag)) {
      return NodePartPredicate.fromValue(value);
    } else if ("hash".equals(tag)) {
      return HashPartPredicate.fromValue(value);
    } else {
      return null;
    }
  }
}

final class PartPredicateForm extends Form<PartPredicate> {
  @Override
  public Class<?> type() {
    return PartPredicate.class;
  }

  @Override
  public PartPredicate unit() {
    return PartPredicate.any();
  }

  @Override
  public Value mold(PartPredicate predicate) {
    return predicate.toValue();
  }

  @Override
  public PartPredicate cast(Item item) {
    return PartPredicate.fromValue(item.toValue());
  }
}

final class AnyPartPredicate extends PartPredicate {
  @Override
  public boolean test(Uri nodeUri, int nodeHash) {
    return true;
  }

  @Override
  public PartPredicate and(PartPredicate that) {
    return that;
  }

  @Override
  public Value toValue() {
    return Value.absent();
  }

  @Override
  public String toString() {
    return "PartPredicate" + '.' + "ANY";
  }
}

final class AndPartPredicate extends PartPredicate {
  final PartPredicate[] predicates;

  AndPartPredicate(PartPredicate[] predicates) {
    this.predicates = predicates;
  }

  AndPartPredicate(PartPredicate f, PartPredicate g) {
    this(new PartPredicate[] {f, g});
  }

  @Override
  public boolean test(Uri nodeUri, int nodeHash) {
    for (int i = 0, n = predicates.length; i < n; i += 1) {
      if (!predicates[i].test(nodeUri, nodeHash)) {
        return false;
      }
    }
    return true;
  }

  @Override
  public PartPredicate and(PartPredicate that) {
    final int n = predicates.length;
    final PartPredicate[] newPredicates = new PartPredicate[n + 1];
    System.arraycopy(predicates, 0, newPredicates, 0, n);
    newPredicates[n] = that;
    return new AndPartPredicate(newPredicates);
  }

  @Override
  public Value toValue() {
    final int n = predicates.length;
    final Record record = Record.create(n);
    for (int i = 0; i < n; i += 1) {
      record.add(predicates[i].toValue());
    }
    return record;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof AndPartPredicate) {
      final AndPartPredicate that = (AndPartPredicate) other;
      final int n = predicates.length;
      if (n == that.predicates.length) {
        for (int i = 0; i < n; i += 1) {
          if (!predicates[i].equals(that.predicates[i])) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  @Override
  public int hashCode() {
    int code = 0xFA5FC906;
    for (int i = 0, n = predicates.length; i < n; i += 1) {
      code = Murmur3.mix(code, predicates[i].hashCode());
    }
    return Murmur3.mash(code);
  }

  @Override
  public String toString() {
    final StringBuilder s = new StringBuilder("PartPredicate").append('.').append("and").append('(');
    for (int i = 0, n = predicates.length; i < n; i += 1) {
      if (i > 0) {
        s.append(", ");
      }
      s.append(predicates[i]);
    }
    return s.append(')').toString();
  }
}

final class NodePartPredicate extends PartPredicate {
  final UriPattern nodePattern;

  NodePartPredicate(UriPattern nodePattern) {
    this.nodePattern = nodePattern;
  }

  @Override
  public boolean test(Uri nodeUri, int nodeHash) {
    return nodePattern.matches(nodeUri);
  }

  @Override
  public Value toValue() {
    return Record.create(1).attr("node", nodePattern.toString());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof NodePartPredicate) {
      final NodePartPredicate that = (NodePartPredicate) other;
      return nodePattern.equals(that.nodePattern);
    } else {
      return false;
    }
  }

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(0x6C13D8A9, nodePattern.hashCode()));
  }

  @Override
  public String toString() {
    return "PartPredicate" + '.' + "node" + '(' + nodePattern + ')';
  }

  public static NodePartPredicate fromValue(Value value) {
    final UriPattern nodePattern = UriPattern.parse(value.getAttr("node").stringValue());
    return new NodePartPredicate(nodePattern);
  }
}

final class HashPartPredicate extends PartPredicate {
  final int lowerBound;
  final int upperBound;

  HashPartPredicate(int lowerBound, int upperBound) {
    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
  }

  @Override
  public boolean test(Uri nodeUri, int nodeHash) {
    final long dlh = (long) (nodeHash - lowerBound) & 0xffffffffL;
    return 0L <= dlh && dlh < ((long) (upperBound - lowerBound) & 0xffffffffL);
  }

  @Override
  public Value toValue() {
    return Record.create(1).attr("hash", Record.create(2).item(lowerBound).item(upperBound));
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HashPartPredicate) {
      final HashPartPredicate that = (HashPartPredicate) other;
      return lowerBound == that.lowerBound && upperBound == that.upperBound;
    } else {
      return false;
    }
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(HashPartPredicate.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed, lowerBound), upperBound));
  }

  @Override
  public String toString() {
    return "PartPredicate" + '.' + "hash" + '(' + lowerBound + ", " + upperBound + ')';
  }

  public static HashPartPredicate fromValue(Value value) {
    final Value header = value.getAttr("hash");
    final int lowerBound = header.getItem(0).intValue();
    final int upperBound = header.getItem(1).intValue();
    return new HashPartPredicate(lowerBound, upperBound);
  }
}
