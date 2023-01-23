// Copyright 2015-2023 Swim.inc
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

package swim.vm.js;

import java.util.Map;
import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Source;
import swim.collections.HashTrieMap;
import swim.dynamic.HostArrayType;
import swim.dynamic.HostClassType;
import swim.dynamic.HostLibrary;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.HostStaticMethod;
import swim.dynamic.HostType;
import swim.uri.UriPath;
import swim.vm.VmBridge;
import swim.vm.VmHostArray;

public class JsBridge extends VmBridge implements JsModuleResolver, JsModuleLoader {

  final Context jsContext;
  HashTrieMap<HostType<?>, Object> guestTypes;
  HashTrieMap<HostType<?>, Object> guestPrototypes;
  Object guestObjectPrototype;
  Object guestFunctionPrototype;

  public JsBridge(JsRuntime jsRuntime, Context jsContext) {
    super(jsRuntime, "js");
    this.jsContext = jsContext;
    this.guestTypes = HashTrieMap.empty();
    this.guestPrototypes = HashTrieMap.empty();
    this.guestObjectPrototype = null;
    this.guestFunctionPrototype = null;
  }

  public final JsRuntime jsRuntime() {
    return (JsRuntime) this.hostRuntime();
  }

  public final Context jsContext() {
    return this.jsContext;
  }

  public JsModuleResolver moduleResolver() {
    return this.jsRuntime().moduleResolver();
  }

  public HostLibrary getHostModule(UriPath moduleId) {
    return this.jsRuntime().getHostModule(moduleId);
  }

  public Map<UriPath, HostLibrary> hostModules() {
    return this.jsRuntime().hostModules();
  }

  @Override
  public <T> Object hostTypedValueToGuestProxy(HostType<? super T> hostType, T hostValue) {
    final Object guestProxy;
    if (hostType instanceof HostObjectType<?>) {
      guestProxy = new JsHostObject<T>(this, (HostObjectType<? super T>) hostType, hostValue);
    } else if (hostType instanceof HostArrayType<?>) {
      guestProxy = new VmHostArray<T>(this, (HostArrayType<? super T>) hostType, hostValue);
    } else {
      throw new UnsupportedOperationException();
    }
    return guestProxy;
  }

  @Override
  public <T> Object hostMethodToGuestMethod(HostMethod<? super T> method, T self) {
    return new JsHostMethod<T>(this, method, self);
  }

  @Override
  public Object hostStaticMethodToGuestStaticMethod(HostStaticMethod staticMethod) {
    return new JsHostStaticMethod(this, staticMethod);
  }

  protected Object createGuestType(HostType<?> hostType) {
    final Object guestType;
    if (hostType instanceof HostClassType<?>) {
      guestType = new JsHostClass(this, (HostClassType<?>) hostType);
    } else if (hostType != null) {
      guestType = new JsHostType(this, hostType);
    } else {
      throw new NullPointerException();
    }
    return guestType;
  }

  public Object hostTypeToGuestType(HostType<?> hostType) {
    HashTrieMap<HostType<?>, Object> guestTypes = this.guestTypes;
    Object guestType = guestTypes.get(hostType);
    if (guestType == null) {
      guestType = this.createGuestType(hostType);
      guestTypes = guestTypes.updated(hostType, guestType);
      this.guestTypes = guestTypes;
    }
    return guestType;
  }

  protected Object createGuestPrototype(HostType<?> hostType) {
    final Object guestPrototype;
    if (hostType instanceof HostClassType<?>) {
      guestPrototype = new JsHostPrototype(this, (HostClassType<?>) hostType);
    } else {
      guestPrototype = null;
    }
    return guestPrototype;
  }

  public Object hostTypeToGuestPrototype(HostType<?> hostType) {
    HashTrieMap<HostType<?>, Object> guestPrototypes = this.guestPrototypes;
    Object guestPrototype = guestPrototypes.get(hostType);
    if (guestPrototype == null) {
      guestPrototype = this.createGuestPrototype(hostType);
      if (guestPrototype == null) {
        guestPrototype = this.guestObjectPrototype();
      } else {
        guestPrototypes = guestPrototypes.updated(hostType, guestPrototype);
        this.guestPrototypes = guestPrototypes;
      }
    }
    return guestPrototype;
  }

  public Object guestObjectPrototype() {
    Object prototype = this.guestObjectPrototype;
    if (prototype == null) {
      prototype = this.jsContext.getBindings("js").getMember("Object").getMember("prototype");
      this.guestObjectPrototype = prototype;
    }
    return prototype;
  }

  public Object guestFunctionPrototype() {
    Object prototype = this.guestFunctionPrototype;
    if (prototype == null) {
      prototype = this.jsContext.getBindings("js").getMember("Function").getMember("prototype");
      this.guestFunctionPrototype = prototype;
    }
    return prototype;
  }

  @Override
  public UriPath resolveModulePath(UriPath basePath, UriPath modulePath) {
    if (this.getHostModule(modulePath) != null) {
      return modulePath;
    } else {
      return this.moduleResolver().resolveModulePath(basePath, modulePath);
    }
  }

  @Override
  public Source loadModuleSource(UriPath moduleId) {
    return this.moduleResolver().loadModuleSource(moduleId);
  }

  @Override
  public JsModule loadModule(JsModuleSystem moduleSystem, UriPath moduleId) {
    JsModule module = this.loadHostModule(moduleSystem, moduleId);
    if (module == null) {
      module = this.loadGuestModule(moduleSystem, moduleId);
    }
    return module;
  }

  protected JsModule loadHostModule(JsModuleSystem moduleSystem, UriPath moduleId) {
    final HostLibrary hostLibrary = this.getHostModule(moduleId);
    if (hostLibrary != null) {
      return this.createHostModule(moduleSystem, moduleId, hostLibrary);
    }
    return null;
  }

  protected JsModule createHostModule(JsModuleSystem moduleSystem, UriPath moduleId, HostLibrary hostLibrary) {
    return new JsHostLibraryModule(this, moduleSystem, moduleId, hostLibrary);
  }

  protected JsModule loadGuestModule(JsModuleSystem moduleSystem, UriPath moduleId) {
    final Source moduleSource = this.loadModuleSource(moduleId);
    if (moduleSource != null) {
      return this.createGuestModule(moduleSystem, moduleId, moduleSource);
    }
    return null;
  }

  protected JsModule createGuestModule(JsModuleSystem moduleSystem, UriPath moduleId, Source moduleSource) {
    return new JsGuestModule(moduleSystem, moduleId, moduleSource);
  }

  @Override
  public void evalModule(JsModule module) {
    module.evalModule();
  }

  public JsModule eval(UriPath moduleId, Source moduleSource) {
    final JsModuleSystem moduleSystem = new JsModuleSystem(this.jsContext, this);
    final JsModule module = this.createGuestModule(moduleSystem, moduleId, moduleSource);
    this.evalModule(module);
    return module;
  }

  public JsModule eval(UriPath moduleId, CharSequence source) {
    final Source moduleSource = Source.newBuilder("js", source, moduleId.toString()).buildLiteral();
    return this.eval(moduleId, moduleSource);
  }

  public JsModule eval(String moduleId, CharSequence source) {
    final Source moduleSource = Source.newBuilder("js", source, moduleId).buildLiteral();
    return this.eval(UriPath.parse(moduleId), moduleSource);
  }

}
