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

package swim.vm;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Value;
import org.testng.annotations.Test;
import swim.dynamic.AbstractHostObjectType;
import swim.dynamic.Bridge;
import swim.dynamic.HostField;
import swim.dynamic.HostMember;
import swim.dynamic.HostMethod;
import swim.dynamic.HostStaticMember;
import swim.dynamic.HostType;
import swim.dynamic.JavaHostRuntime;
import static org.testng.Assert.assertEquals;

class Foo {
  final String bar = "BAR";

  String baz() {
    return "BAZ";
  }

  static final FooType TYPE = new FooType();
}

class FooType extends AbstractHostObjectType<Foo> {
  @Override
  public Class<?> hostClass() {
    return Foo.class;
  }

  @Override
  public HostType<? super Foo> superType() {
    return null;
  }

  @Override
  public List<HostType<? super Foo>> baseTypes() {
    return Arrays.asList();
  }

  @Override
  public HostMember<? super Foo> getOwnMember(Bridge bridge, Foo foo, String key) {
    switch (key) {
      case "bar": return BAR;
      case "baz": return BAZ;
      default: return null;
    }
  }

  @Override
  public Collection<HostMember<? super Foo>> ownMembers(Bridge bridge, Foo foo) {
    return Arrays.asList(BAR, BAZ);
  }

  @Override
  public HostStaticMember getOwnStaticMember(Bridge bridge, String key) {
    return null;
  }

  @Override
  public Collection<HostStaticMember> ownStaticMembers(Bridge bridge) {
    return Arrays.asList();
  }

  static final FooBar BAR = new FooBar();
  static final FooBaz BAZ = new FooBaz();
}

class FooBar implements HostField<Foo> {
  @Override
  public String key() {
    return "bar";
  }

  @Override
  public Object get(Bridge bridge, Foo foo) {
    return foo.bar;
  }
}

class FooBaz implements HostMethod<Foo> {
  @Override
  public String key() {
    return "baz";
  }

  @Override
  public Object invoke(Bridge bridge, Foo foo, Object... arguments) {
    return foo.baz();
  }
}

public class VmHostObjectSpec {
  @Test
  public void testGetMember() {
    try (Context context = Context.create()) {
      final JavaHostRuntime runtime = new JavaHostRuntime();
      final VmBridge bridge = new VmBridge(runtime, "js");
      runtime.addHostType(Foo.TYPE);

      final Value bindings = context.getBindings("js");
      bindings.putMember("foo", bridge.hostToGuest(new Foo()));

      assertEquals(context.eval("js", "foo.bar").asString(), "BAR");
    }
  }

  @Test
  public void testInvokeMember() {
    try (Context context = Context.create()) {
      final JavaHostRuntime runtime = new JavaHostRuntime();
      final VmBridge bridge = new VmBridge(runtime, "js");
      runtime.addHostType(Foo.TYPE);

      final Value bindings = context.getBindings("js");
      bindings.putMember("foo", bridge.hostToGuest(new Foo()));

      assertEquals(context.eval("js", "foo.baz()").asString(), "BAZ");
    }
  }
}
