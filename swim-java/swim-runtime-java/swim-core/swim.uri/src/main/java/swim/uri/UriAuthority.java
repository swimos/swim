// Copyright 2015-2022 Swim.inc
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

public class UriAuthority extends UriPart implements Comparable<UriAuthority>, Debug, Display {

  protected final UriUser user;
  protected final UriHost host;
  protected final UriPort port;
  String string;

  protected UriAuthority(UriUser user, UriHost host, UriPort port) {
    this.user = user;
    this.host = host;
    this.port = port;
  }

  public final boolean isDefined() {
    return this.user.isDefined() || this.host.isDefined() || this.port.isDefined();
  }

  public final UriUser user() {
    return this.user;
  }

  public UriAuthority user(UriUser user) {
    if (user != this.user) {
      return this.copy(user, this.host, this.port);
    } else {
      return this;
    }
  }

  public final String userPart() {
    return this.user.toString();
  }

  public UriAuthority userPart(String user) {
    return this.user(UriUser.parse(user));
  }

  public String username() {
    return this.user.username();
  }

  public UriAuthority username(String username) {
    return this.user(this.user.username(username));
  }

  public UriAuthority username(String username, String password) {
    return this.user(UriUser.create(username, password));
  }

  public String password() {
    return this.user.password();
  }

  public UriAuthority password(String password) {
    return this.user(this.user.password(password));
  }

  public final UriHost host() {
    return this.host;
  }

  public UriAuthority host(UriHost host) {
    if (host != this.host) {
      return this.copy(this.user, host, this.port);
    } else {
      return this;
    }
  }

  public final String hostPart() {
    return this.host.toString();
  }

  public UriAuthority hostPart(String host) {
    return this.host(UriHost.parse(host));
  }

  public final String hostAddress() {
    return this.host.address();
  }

  public final String hostName() {
    return this.host.name();
  }

  public UriAuthority hostName(String address) {
    return this.host(UriHost.name(address));
  }

  public final String hostIPv4() {
    return this.host.ipv4();
  }

  public UriAuthority hostIPv4(String address) {
    return this.host(UriHost.ipv4(address));
  }

  public final String hostIPv6() {
    return this.host.ipv6();
  }

  public UriAuthority hostIPv6(String address) {
    return this.host(UriHost.ipv6(address));
  }

  public final UriPort port() {
    return this.port;
  }

  public UriAuthority port(UriPort port) {
    if (port != this.port) {
      return this.copy(this.user, this.host, port);
    } else {
      return this;
    }
  }

  public final String portPart() {
    return this.port.toString();
  }

  public UriAuthority portPart(String port) {
    return this.port(UriPort.parse(port));
  }

  public final int portNumber() {
    return this.port.number();
  }

  public UriAuthority portNumber(int number) {
    return this.port(UriPort.create(number));
  }

  protected UriAuthority copy(UriUser user, UriHost host, UriPort port) {
    return UriAuthority.create(user, host, port);
  }

  @Override
  public final int compareTo(UriAuthority that) {
    return this.toString().compareTo(that.toString());
  }

  @Override
  public final boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriAuthority) {
      return this.toString().equals(((UriAuthority) other).toString());
    }
    return false;
  }

  @Override
  public final int hashCode() {
    return Murmur3.seed(this.toString());
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("UriAuthority").write('.');
    if (this.isDefined()) {
      output = output.write("parse").write('(').write('"').display(this).write('"');
    } else {
      output = output.write("undefined").write('(');
    }
    output = output.write(')');
    return output;
  }

  @Override
  public <T> Output<T> display(Output<T> output) {
    if (this.string != null) {
      output = output.write(this.string);
    } else {
      if (this.user.isDefined()) {
        output = output.display(this.user).write('@');
      }
      output = output.display(this.host);
      if (this.port.isDefined()) {
        output = output.write(':').display(this.port);
      }
    }
    return output;
  }

  @Override
  public final String toString() {
    if (this.string == null) {
      this.string = Format.display(this);
    }
    return this.string;
  }

  private static UriAuthority undefined;

  public static UriAuthority undefined() {
    if (UriAuthority.undefined == null) {
      UriAuthority.undefined = new UriAuthority(UriUser.undefined(), UriHost.undefined(), UriPort.undefined());
    }
    return UriAuthority.undefined;
  }

  public static UriAuthority create(UriUser user, UriHost host, UriPort port) {
    if (user == null) {
      user = UriUser.undefined();
    }
    if (host == null) {
      host = UriHost.undefined();
    }
    if (port == null) {
      port = UriPort.undefined();
    }
    if (user.isDefined() || host.isDefined() || port.isDefined()) {
      return new UriAuthority(user, host, port);
    } else {
      return UriAuthority.undefined();
    }
  }

  public static UriAuthority create(UriHost host, UriPort port) {
    return UriAuthority.create(null, host, port);
  }

  public static UriAuthority create(UriHost host) {
    return UriAuthority.create(null, host, null);
  }

  public static UriAuthority parse(String string) {
    return Uri.standardParser().parseAuthorityString(string);
  }

}
