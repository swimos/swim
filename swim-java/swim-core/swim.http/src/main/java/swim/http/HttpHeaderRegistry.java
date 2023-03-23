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

package swim.http;

import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Iterator;
import java.util.ServiceLoader;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.collections.FingerTrieList;
import swim.collections.StringTrieMap;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public class HttpHeaderRegistry implements ToSource {

  HttpHeaderProvider[] providers;

  StringTrieMap<HttpHeaderType<?, ?>> headerTypes;

  public HttpHeaderRegistry() {
    this.providers = new HttpHeaderProvider[0];
    this.headerTypes = StringTrieMap.caseInsensitive();
    this.loadIntrinsics();
    this.loadExtensions();
    this.registerHeaderTypes();
  }

  public final FingerTrieList<HttpHeaderProvider> providers() {
    return FingerTrieList.of(this.providers);
  }

  @SuppressWarnings("ReferenceEquality")
  public void addProvider(HttpHeaderProvider provider) {
    HttpHeaderProvider[] providers = (HttpHeaderProvider[]) PROVIDERS.getOpaque(this);
    do {
      int index = providers.length - 1;
      while (index >= 0) {
        if (provider.priority() < providers[index].priority()) {
          index -= 1;
        } else {
          index += 1;
          break;
        }
      }
      if (index < 0) {
        index = 0;
      }
      final HttpHeaderProvider[] oldProviders = providers;
      final HttpHeaderProvider[] newProviders = new HttpHeaderProvider[oldProviders.length + 1];
      System.arraycopy(oldProviders, 0, newProviders, 0, index);
      newProviders[index] = provider;
      System.arraycopy(oldProviders, index, newProviders, index + 1, oldProviders.length - index);
      providers = (HttpHeaderProvider[]) PROVIDERS.compareAndExchangeRelease(this, oldProviders, newProviders);
      if (providers == oldProviders) {
        break;
      }
    } while (true);
  }

  protected void loadIntrinsics() {
    this.addProvider(HttpHeaderTypes.provider());
  }

  protected void loadExtensions() {
    final ServiceLoader<HttpHeaderProvider> serviceLoader = ServiceLoader.load(HttpHeaderProvider.class, HttpHeaderRegistry.class.getClassLoader());
    final Iterator<ServiceLoader.Provider<HttpHeaderProvider>> serviceProviders = serviceLoader.stream().iterator();
    while (serviceProviders.hasNext()) {
      final ServiceLoader.Provider<HttpHeaderProvider> serviceProvider = serviceProviders.next();
      final Class<? extends HttpHeaderProvider> providerClass = serviceProvider.type();
      HttpHeaderProvider provider = null;

      // public static HttpHeaderProvider provider();
      try {
        final Method method = providerClass.getDeclaredMethod("provider");
        if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
            && HttpHeaderProvider.class.isAssignableFrom(method.getReturnType())) {
          provider = (HttpHeaderProvider) method.invoke(null);
        }
      } catch (ReflectiveOperationException cause) {
        // swallow
      }

      if (provider == null) {
        provider = serviceProvider.get();
      }
      this.addProvider(provider);
    }
  }

  public StringTrieMap<HttpHeaderType<?, ?>> headerTypes() {
    return (StringTrieMap<HttpHeaderType<?, ?>>) HEADER_TYPES.getOpaque(this);
  }

  protected void registerHeaderTypes() {
    final HttpHeaderProvider[] providers = (HttpHeaderProvider[]) PROVIDERS.getOpaque(this);
    for (int i = 0; i < providers.length; i += 1) {
      providers[i].registerHeaderTypes(this);
    }
  }

  @SuppressWarnings("ReferenceEquality")
  public void registerHeaderType(HttpHeaderType<?, ?> headerType) {
    StringTrieMap<HttpHeaderType<?, ?>> headerTypes = (StringTrieMap<HttpHeaderType<?, ?>>) HEADER_TYPES.getOpaque(this);
    do {
      final StringTrieMap<HttpHeaderType<?, ?>> oldHeaderTypes = headerTypes;
      final StringTrieMap<HttpHeaderType<?, ?>> newHeaderTypes = oldHeaderTypes.updated(headerType.name(), headerType);
      headerTypes = (StringTrieMap<HttpHeaderType<?, ?>>) HEADER_TYPES.compareAndExchangeRelease(this, oldHeaderTypes, newHeaderTypes);
      if (headerTypes == oldHeaderTypes) {
        break;
      }
    } while (true);
  }

  public @Nullable HttpHeaderType<?, ?> getHeaderType(String headerName) {
    final StringTrieMap<HttpHeaderType<?, ?>> headerTypes = (StringTrieMap<HttpHeaderType<?, ?>>) HEADER_TYPES.getOpaque(this);
    return headerTypes.get(headerName);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpHeader", "registry").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final HttpHeaderRegistry REGISTRY;

  /**
   * {@code VarHandle} for atomically accessing the {@link #providers} field.
   */
  static final VarHandle PROVIDERS;

  /**
   * {@code VarHandle} for atomically accessing the {@link #headerTypes} field.
   */
  static final VarHandle HEADER_TYPES;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      PROVIDERS = lookup.findVarHandle(HttpHeaderRegistry.class, "providers", HttpHeaderProvider.class.arrayType());
      HEADER_TYPES = lookup.findVarHandle(HttpHeaderRegistry.class, "headerTypes", StringTrieMap.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
    REGISTRY = new HttpHeaderRegistry();
  }

}
