// Copyright 2015-2023 Nstream, inc.
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

package swim.system;

import swim.structure.Extant;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.structure.operator.AndOperator;
import swim.structure.operator.OrOperator;
import swim.uri.Uri;
import swim.uri.UriPattern;
import swim.util.Murmur3;

public abstract class PartPredicate {

  protected PartPredicate() {
    // sealed
  }

  public abstract boolean test(Uri nodeUri, int nodeHash);

  public boolean test(Uri nodeUri) {
    return this.test(nodeUri, nodeUri.hashCode());
  }

  public PartPredicate or(PartPredicate that) {
    return new OrPartPredicate(this, that);
  }

  public PartPredicate and(PartPredicate that) {
    return new AndPartPredicate(this, that);
  }

  public abstract Value toValue();

  private static PartPredicate any;

  public static PartPredicate any() {
    if (PartPredicate.any == null) {
      PartPredicate.any = new AnyPartPredicate();
    }
    return PartPredicate.any;
  }

  public static PartPredicate or(PartPredicate... predicates) {
    return new OrPartPredicate(predicates);
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
    } else if ("mod".equals(tag)) {
      return ModPartPredicate.fromValue(value);
    } else if (value instanceof OrOperator) {
      final PartPredicate lhs = fromValue(((OrOperator) value).lhs().toValue());
      final PartPredicate rhs = fromValue(((OrOperator) value).rhs().toValue());
      if (lhs != null && rhs != null) {
        return new OrPartPredicate(lhs, rhs);
      }
    } else if (value instanceof AndOperator) {
      final PartPredicate lhs = fromValue(((AndOperator) value).lhs().toValue());
      final PartPredicate rhs = fromValue(((AndOperator) value).rhs().toValue());
      if (lhs != null && rhs != null) {
        return new AndPartPredicate(lhs, rhs);
      }
    } else if (value instanceof Extant) {
      return PartPredicate.any();
    }
    return null;
  }

  private static Form<PartPredicate> form;

  @Kind
  public static Form<PartPredicate> form() {
    if (PartPredicate.form == null) {
      PartPredicate.form = new PartPredicateForm();
    }
    return PartPredicate.form;
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

final class OrPartPredicate extends PartPredicate {

  final PartPredicate[] predicates;

  OrPartPredicate(PartPredicate[] predicates) {
    this.predicates = predicates;
  }

  OrPartPredicate(PartPredicate f, PartPredicate g) {
    this(new PartPredicate[] {f, g});
  }

  @Override
  public boolean test(Uri nodeUri, int nodeHash) {
    final PartPredicate[] predicates = this.predicates;
    for (int i = 0, n = predicates.length; i < n; i += 1) {
      if (predicates[i].test(nodeUri, nodeHash)) {
        return true;
      }
    }
    return false;
  }

  @Override
  public PartPredicate or(PartPredicate that) {
    final PartPredicate[] predicates = this.predicates;
    final int n = predicates.length;
    final PartPredicate[] newPredicates = new PartPredicate[n + 1];
    System.arraycopy(predicates, 0, newPredicates, 0, n);
    newPredicates[n] = that;
    return new OrPartPredicate(newPredicates);
  }

  @Override
  public Value toValue() {
    final PartPredicate[] predicates = this.predicates;
    final int n = predicates.length;
    if (n > 0) {
      Value value = predicates[0].toValue();
      for (int i = 1; i < n; i += 1) {
        value = new OrOperator(value, predicates[i].toValue());
      }
      return value;
    } else {
      return Value.absent();
    }
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof OrPartPredicate) {
      final OrPartPredicate that = (OrPartPredicate) other;
      final int n = this.predicates.length;
      if (n == that.predicates.length) {
        for (int i = 0; i < n; i += 1) {
          if (!this.predicates[i].equals(that.predicates[i])) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (OrPartPredicate.hashSeed == 0) {
      OrPartPredicate.hashSeed = Murmur3.seed(OrPartPredicate.class);
    }
    int code = OrPartPredicate.hashSeed;
    for (int i = 0, n = this.predicates.length; i < n; i += 1) {
      code = Murmur3.mix(code, this.predicates[i].hashCode());
    }
    return Murmur3.mash(code);
  }

  @Override
  public String toString() {
    final StringBuilder s = new StringBuilder("PartPredicate").append('.').append("or").append('(');
    for (int i = 0, n = this.predicates.length; i < n; i += 1) {
      if (i > 0) {
        s.append(", ");
      }
      s.append(this.predicates[i]);
    }
    return s.append(')').toString();
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
    final PartPredicate[] predicates = this.predicates;
    for (int i = 0, n = predicates.length; i < n; i += 1) {
      if (!predicates[i].test(nodeUri, nodeHash)) {
        return false;
      }
    }
    return true;
  }

  @Override
  public PartPredicate and(PartPredicate that) {
    final PartPredicate[] predicates = this.predicates;
    final int n = predicates.length;
    final PartPredicate[] newPredicates = new PartPredicate[n + 1];
    System.arraycopy(predicates, 0, newPredicates, 0, n);
    newPredicates[n] = that;
    return new AndPartPredicate(newPredicates);
  }

  @Override
  public Value toValue() {
    final PartPredicate[] predicates = this.predicates;
    final int n = predicates.length;
    if (n > 0) {
      Value value = predicates[0].toValue();
      for (int i = 1; i < n; i += 1) {
        value = new AndOperator(value, predicates[i].toValue());
      }
      return value;
    } else {
      return Value.absent();
    }
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof AndPartPredicate) {
      final AndPartPredicate that = (AndPartPredicate) other;
      final int n = this.predicates.length;
      if (n == that.predicates.length) {
        for (int i = 0; i < n; i += 1) {
          if (!this.predicates[i].equals(that.predicates[i])) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (AndPartPredicate.hashSeed == 0) {
      AndPartPredicate.hashSeed = Murmur3.seed(AndPartPredicate.class);
    }
    int code = AndPartPredicate.hashSeed;
    for (int i = 0, n = this.predicates.length; i < n; i += 1) {
      code = Murmur3.mix(code, this.predicates[i].hashCode());
    }
    return Murmur3.mash(code);
  }

  @Override
  public String toString() {
    final StringBuilder s = new StringBuilder("PartPredicate").append('.').append("and").append('(');
    for (int i = 0, n = this.predicates.length; i < n; i += 1) {
      if (i > 0) {
        s.append(", ");
      }
      s.append(this.predicates[i]);
    }
    return s.append(')').toString();
  }

}

final class NodePartPredicate extends PartPredicate {

  final UriPattern nodePattern;

  NodePartPredicate(UriPattern nodePattern) {
    this.nodePattern = nodePattern;
  }

  public static NodePartPredicate fromValue(Value value) {
    final UriPattern nodePattern = UriPattern.parse(value.getAttr("node").stringValue());
    return new NodePartPredicate(nodePattern);
  }

  @Override
  public boolean test(Uri nodeUri, int nodeHash) {
    return this.nodePattern.matches(nodeUri);
  }

  @Override
  public Value toValue() {
    return Record.create(1).attr("node", this.nodePattern.toString());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof NodePartPredicate) {
      final NodePartPredicate that = (NodePartPredicate) other;
      return this.nodePattern.equals(that.nodePattern);
    } else {
      return false;
    }
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (NodePartPredicate.hashSeed == 0) {
      NodePartPredicate.hashSeed = Murmur3.seed(NodePartPredicate.class);
    }
    return Murmur3.mash(Murmur3.mix(NodePartPredicate.hashSeed, this.nodePattern.hashCode()));
  }

  @Override
  public String toString() {
    return "PartPredicate" + '.' + "node" + '(' + this.nodePattern + ')';
  }

}

final class ModPartPredicate extends PartPredicate {

  final int slot;
  final int count;

  ModPartPredicate(int slot, int count) {
    this.slot = slot;
    this.count = count;
  }

  @Override
  public boolean test(Uri nodeUri, int nodeHash) {
    return nodeHash % this.count == this.slot;
  }

  @Override
  public Value toValue() {
    return Record.create(1).attr("mod", Record.create(2).item(this.slot)
        .item(this.count));
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ModPartPredicate) {
      final ModPartPredicate that = (ModPartPredicate) other;
      return this.slot == that.slot && this.count == that.count;
    } else {
      return false;
    }
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (ModPartPredicate.hashSeed == 0) {
      ModPartPredicate.hashSeed = Murmur3.seed(ModPartPredicate.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(ModPartPredicate.hashSeed,
        this.slot), this.count));
  }

  @Override
  public String toString() {
    return "ModPredicate" + '.' + "hash" + '(' + this.slot + ", " + this.count + ')';
  }

  public static ModPartPredicate fromValue(Value value) {
    final Value header = value.getAttr("mod");
    final int slot = header.getItem(0).intValue();
    final int count = header.getItem(1).intValue();
    return new ModPartPredicate(slot, count);
  }

}

final class HashPartPredicate extends PartPredicate {

  final int lowerBound;
  final int upperBound;

  HashPartPredicate(int lowerBound, int upperBound) {
    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
  }

  public static HashPartPredicate fromValue(Value value) {
    final Value header = value.getAttr("hash");
    final int lowerBound = header.getItem(0).intValue();
    final int upperBound = header.getItem(1).intValue();
    return new HashPartPredicate(lowerBound, upperBound);
  }

  @Override
  public boolean test(Uri nodeUri, int nodeHash) {
    final long dlh = (long) (nodeHash - this.lowerBound) & 0xffffffffL;
    return 0L <= dlh && dlh < ((long) (this.upperBound - this.lowerBound) & 0xffffffffL);
  }

  @Override
  public Value toValue() {
    return Record.create(1).attr("hash", Record.create(2).item(this.lowerBound)
                                                         .item(this.upperBound));
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HashPartPredicate) {
      final HashPartPredicate that = (HashPartPredicate) other;
      return this.lowerBound == that.lowerBound && this.upperBound == that.upperBound;
    } else {
      return false;
    }
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (HashPartPredicate.hashSeed == 0) {
      HashPartPredicate.hashSeed = Murmur3.seed(HashPartPredicate.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HashPartPredicate.hashSeed,
        this.lowerBound), this.upperBound));
  }

  @Override
  public String toString() {
    return "PartPredicate" + '.' + "hash" + '(' + this.lowerBound + ", " + this.upperBound + ')';
  }

}
