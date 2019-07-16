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

import swim.codec.Debug;
import swim.codec.Display;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Murmur3;

public class UriUser implements Debug, Display {
  protected final String username;
  protected final String password;

  protected UriUser(String username, String password) {
    this.username = username;
    this.password = password;
  }

  public boolean isDefined() {
    return this.username != null;
  }

  public String username() {
    return this.username != null ? this.username : "";
  }

  public UriUser username(String username) {
    if (username != this.username) {
      return copy(username, this.password);
    } else {
      return this;
    }
  }

  public String password() {
    return this.password != null ? this.password : "";
  }

  public UriUser password(String password) {
    if (password != this.password) {
      return copy(this.username, password);
    } else {
      return this;
    }
  }

  protected UriUser copy(String username, String password) {
    return UriUser.from(username, password);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriUser) {
      final UriUser that = (UriUser) other;
      return (this.username == null ? that.username == null : this.username.equals(that.username))
          && (this.password == null ? that.password == null : this.password.equals(that.password));
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(UriUser.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.username)), Murmur3.hash(this.password)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("UriUser").write('.');
    if (isDefined()) {
      output = output.write("parse").write('(').write('"').display(this).write('"').write(')');
    } else {
      output = output.write("undefined").write('(').write(')');
    }
  }

  @Override
  public void display(Output<?> output) {
    if (this.username != null) {
      Uri.writeUser(this.username, output);
      if (this.password != null) {
        output = output.write(':');
        Uri.writeUser(this.password, output);
      }
    }
  }

  @Override
  public String toString() {
    return Format.display(this);
  }

  private static int hashSeed;

  private static UriUser undefined;

  public static UriUser undefined() {
    if (undefined == null) {
      undefined = new UriUser(null, null);
    }
    return undefined;
  }

  public static UriUser from(String username) {
    if (username != null) {
      return new UriUser(username, null);
    } else {
      return undefined();
    }
  }

  public static UriUser from(String username, String password) {
    if (username != null || password != null) {
      if (username == null) {
        username = "";
      }
      return new UriUser(username, password);
    } else {
      return undefined();
    }
  }

  public static UriUser parse(String string) {
    return Uri.standardParser().parseUserString(string);
  }
}
