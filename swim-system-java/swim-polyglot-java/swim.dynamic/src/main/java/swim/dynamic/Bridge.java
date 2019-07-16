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

package swim.dynamic;

import java.util.Collection;

/**
 * Interface between a guest language execution environment and a host runtime.
 */
public abstract class Bridge {
  public abstract HostRuntime hostRuntime();

  public abstract String guestLanguage();

  public abstract HostLibrary getHostLibrary(String libraryName);

  public abstract Collection<HostLibrary> hostLibraries();

  public abstract HostPackage getHostPackage(String packageName);

  public abstract Collection<HostPackage> hostPackages();

  public abstract HostType<?> getHostType(Class<?> typeClass);

  public abstract Collection<HostType<?>> hostTypes();

  public abstract <T> HostType<? super T> hostType(T hostValue);

  public abstract Object hostToGuest(Object hostValue);

  public abstract Object guestToHost(Object guestValue);

  public abstract boolean guestCanExecute(Object guestFunction);

  public abstract Object guestExecute(Object guestFunction, Object... arguments);

  public abstract void guestExecuteVoid(Object guestFunction, Object... arguments);

  public abstract boolean guestCanInvokeMember(Object guestObject, String member);

  public abstract Object guestInvokeMember(Object guestObject, String member, Object... arguments);
}
