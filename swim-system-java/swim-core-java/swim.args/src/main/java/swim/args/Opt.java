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

package swim.args;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.collections.FingerTrieSeq;
import swim.util.Murmur3;

public class Opt implements Cloneable, Debug {
  final String name;
  char flag;
  String desc;
  FingerTrieSeq<Arg> args;
  int defs;

  public Opt(String name, char flag, String desc, FingerTrieSeq<Arg> args, int defs) {
    this.name = name;
    this.flag = flag;
    this.desc = desc;
    this.args = args;
    this.defs = defs;
  }

  public String name() {
    return this.name;
  }

  public char flag() {
    return this.flag;
  }

  public Opt flag(char flag) {
    this.flag = flag;
    return this;
  }

  public String desc() {
    return this.desc;
  }

  public Opt desc(String desc) {
    this.desc = desc;
    return this;
  }

  public FingerTrieSeq<Arg> args() {
    return this.args;
  }

  public Opt arg(Arg arg) {
    this.args = this.args.appended(arg);
    return this;
  }

  public Opt arg(String arg) {
    return arg(Arg.of(arg));
  }

  public int defs() {
    return this.defs;
  }

  public boolean isDefined() {
    return this.defs != 0;
  }

  public Arg getArg() {
    return getArg(0);
  }

  public Arg getArg(int index) {
    return this.args.get(index);
  }

  public String getValue() {
    return getValue(0);
  }

  public String getValue(int index) {
    final Arg arg = this.args.get(index);
    return arg != null ? arg.value() : null;
  }

  public int parse(String[] params, int paramIndex) {
    final int argCount = this.args.size();
    final int paramCount = params.length;
    for (int argIndex = 0; argIndex < argCount && paramIndex < paramCount; argIndex += 1) {
      final Arg arg = this.args.get(argIndex);
      final String param = params[paramIndex];
      if (!arg.optional || param.charAt(0) != '-') {
        arg.value(param);
        paramIndex += 1;
      } else {
        break;
      }
    }
    return paramIndex;
  }

  public boolean canEqual(Object other) {
    return other instanceof Opt;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Opt) {
      final Opt that = (Opt) other;
      return that.canEqual(this) && this.name.equals(that.name) && this.flag == that.flag
          && (this.desc == null ? that.desc == null : this.desc.equals(that.desc))
          && this.args.equals(that.args) && this.defs == that.defs;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(Opt.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.name.hashCode()), this.flag), Murmur3.hash(this.desc)), this.args.hashCode()), this.defs));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Opt").write('.').write("of").write('(').debug(this.name).write(')');
    if (this.flag != 0) {
      output = output.write('.').write("flag").write('(').debug(this.flag).write(')');
    }
    if (this.desc != null) {
      output = output.write('.').write("desc").write('(').debug(this.desc).write(')');
    }
    final int argCount = this.args.size();
    for (int argIndex = 0; argIndex < argCount; argIndex += 1) {
      final Arg arg = this.args.get(argIndex);
      output = output.write('.').write("arg").write('(').debug(arg).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  @Override
  public Opt clone() {
    final int argCount = this.args.size();
    FingerTrieSeq<Arg> args = FingerTrieSeq.empty();
    for (int i = 0; i < argCount; i += 1) {
      args = args.appended(this.args.get(i).clone());
    }
    return new Opt(this.name, this.flag, this.desc, args, this.defs);
  }

  private static int hashSeed;

  public static Opt of(String name, char flag) {
    return new Opt(name, flag, null, FingerTrieSeq.empty(), 0);
  }

  public static Opt of(String name) {
    return new Opt(name, '\0', null, FingerTrieSeq.empty(), 0);
  }
}
