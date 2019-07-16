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

import java.util.Collection;
import org.graalvm.polyglot.Value;
import org.graalvm.polyglot.proxy.Proxy;
import swim.dynamic.Bridge;
import swim.dynamic.GuestWrapper;
import swim.dynamic.HostArrayType;
import swim.dynamic.HostLibrary;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.HostPackage;
import swim.dynamic.HostRuntime;
import swim.dynamic.HostStaticMethod;
import swim.dynamic.HostType;
import swim.dynamic.HostValue;

public class VmBridge extends Bridge {
  final HostRuntime hostRuntime;
  String guestLanguage;

  public VmBridge(HostRuntime hostRuntime, String guestLanguage) {
    this.hostRuntime = hostRuntime;
    this.guestLanguage = guestLanguage;
  }

  @Override
  public final HostRuntime hostRuntime() {
    return this.hostRuntime;
  }

  @Override
  public final String guestLanguage() {
    return this.guestLanguage;
  }

  protected void setGuestLanguage(String guestLanguage) {
    this.guestLanguage = guestLanguage;
  }

  @Override
  public HostLibrary getHostLibrary(String libraryName) {
    return this.hostRuntime.getHostLibrary(libraryName);
  }

  @Override
  public Collection<HostLibrary> hostLibraries() {
    return this.hostRuntime.hostLibraries();
  }

  @Override
  public HostPackage getHostPackage(String packageName) {
    return this.hostRuntime.getHostPackage(packageName);
  }

  @Override
  public Collection<HostPackage> hostPackages() {
    return this.hostRuntime.hostPackages();
  }

  @Override
  public HostType<?> getHostType(Class<?> typeClass) {
    return this.hostRuntime.getHostType(typeClass);
  }

  @Override
  public Collection<HostType<?>> hostTypes() {
    return this.hostRuntime.hostTypes();
  }

  public boolean isNativeHostClass(Class<?> hostClass) {
    return hostClass.isPrimitive()
        || hostClass == Object.class
        || hostClass == String.class
        || hostClass == Boolean.class
        || hostClass == Byte.class
        || hostClass == Character.class
        || hostClass == Short.class
        || hostClass == Integer.class
        || hostClass == Long.class
        || hostClass == Float.class
        || hostClass == Double.class;
  }

  @SuppressWarnings("unchecked")
  @Override
  public final <T> HostType<? super T> hostType(T hostValue) {
    if (hostValue instanceof HostValue) {
      return (HostType<? super T>) ((HostValue) hostValue).dynamicType();
    } else if (hostValue != null) {
      Class<?> hostClass = hostValue.getClass();
      if (hostClass.isArray()) {
        // TODO: bridge array types
      } else if (!isNativeHostClass(hostClass)) {
        do {
          final HostType<?> hostType = getHostType(hostClass);
          if (hostType != null && !hostType.isBuiltin()) {
            return (HostType<? super T>) hostType;
          }
          hostClass = hostClass.getSuperclass();
        } while (hostClass != null);

        // TODO: dynamically merge implemented interfaces
        final Class<?>[] interfaces = hostValue.getClass().getInterfaces();
        for (int i = 0, n = interfaces.length; i < n; i += 1) {
          final HostType<?> hostType = getHostType(interfaces[i]);
          if (hostType != null && !hostType.isBuiltin()) {
            return (HostType<? super T>) hostType;
          }
        }
      }
    }
    return null;
  }

  public <T> Object hostTypedValueToGuestProxy(HostType<? super T> hostType, T hostValue) {
    if (hostType instanceof HostObjectType<?>) {
      return new VmHostObject<T>(this, (HostObjectType<? super T>) hostType, hostValue);
    } else if (hostType instanceof HostArrayType<?>) {
      return new VmHostArray<T>(this, (HostArrayType<? super T>) hostType, hostValue);
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public Object hostToGuest(Object hostValue) {
    final Object guestValue;
    if (hostValue instanceof Value || hostValue instanceof Proxy) {
      guestValue = hostValue;
    } else if (hostValue instanceof GuestWrapper) {
      guestValue = ((GuestWrapper) hostValue).unwrap();
    } else {
      final HostType<? super Object> hostType = hostType(hostValue);
      if (hostType != null) {
        guestValue = hostTypedValueToGuestProxy(hostType, hostValue);
      } else if (hostValue instanceof Object[]) {
        guestValue = new VmBridgeArray(this, (Object[]) hostValue);
      } else {
        guestValue = hostValue;
      }
    }
    return guestValue;
  }

  @Override
  public Object guestToHost(Object guestValue) {
    Object hostValue;
    if (guestValue instanceof Value) {
      final Value value = (Value) guestValue;
      if (value.isProxyObject()) {
        hostValue = value.asProxyObject();
      } else if (value.isHostObject()) {
        hostValue = value.asHostObject();
      } else if (value.isString()) {
        hostValue = value.asString();
      } else if (value.isNumber()) {
        hostValue = value.as(Number.class);
      } else if (value.isBoolean()) {
        hostValue = value.asBoolean();
      } else if (value.isNull()) {
        hostValue = null;
      } else {
        hostValue = guestValue;
      }
    } else {
      hostValue = guestValue;
    }
    if (hostValue instanceof VmHostProxy<?>) {
      hostValue = ((VmHostProxy<?>) hostValue).unwrap();
    }
    return hostValue;
  }

  public <T> Object hostMethodToGuestMethod(HostMethod<? super T> method, T self) {
    return new VmHostMethod<T>(this, method, self);
  }

  public Object hostStaticMethodToGuestStaticMethod(HostStaticMethod staticMethod) {
    return new VmHostStaticMethod(this, staticMethod);
  }

  @Override
  public boolean guestCanExecute(Object guestFunction) {
    return guestFunction instanceof Value && ((Value) guestFunction).canExecute();
  }

  @Override
  public Object guestExecute(Object guestFunction, Object... hostArguments) {
    if (guestFunction instanceof Value) {
      final int arity = hostArguments.length;
      final Object[] guestArguments = new Object[arity];
      for (int i = 0; i < arity; i += 1) {
        guestArguments[i] = hostToGuest(hostArguments[i]);
      }
      final Object guestResult = ((Value) guestFunction).execute(guestArguments);
      final Object hostResult = guestToHost(guestResult);
      return hostResult;
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public void guestExecuteVoid(Object guestFunction, Object... hostArguments) {
    if (guestFunction instanceof Value) {
      final int arity = hostArguments.length;
      final Object[] guestArguments = new Object[arity];
      for (int i = 0; i < arity; i += 1) {
        guestArguments[i] = hostToGuest(hostArguments[i]);
      }
      ((Value) guestFunction).executeVoid(guestArguments);
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public boolean guestCanInvokeMember(Object guestObject, String member) {
    return guestObject instanceof Value && ((Value) guestObject).canInvokeMember(member);
  }

  @Override
  public Object guestInvokeMember(Object guestObject, String member, Object... hostArguments) {
    if (guestObject instanceof Value) {
      final int arity = hostArguments.length;
      final Object[] guestArguments = new Object[arity];
      for (int i = 0; i < arity; i += 1) {
        guestArguments[i] = hostToGuest(hostArguments[i]);
      }
      final Object guestResult = ((Value) guestObject).invokeMember(member, guestArguments);
      final Object hostResult = guestToHost(guestResult);
      return hostResult;
    } else {
      throw new UnsupportedOperationException();
    }
  }
}
