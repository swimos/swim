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

package swim.loader;

import java.util.Iterator;
import java.util.ServiceLoader;
import swim.api.SwimContext;
import swim.api.client.Client;
import swim.api.client.ClientContext;
import swim.api.router.Router;
import swim.linker.ClientLinker;

public final class ClientLoader {
  private ClientLoader() {
    // nop
  }

  public static Client load() {
    final ClientContext context = loadClientContext();
    final Router router = RouterLoader.loadRouter();
    context.setRouter(router);
    final Client client = loadClient(context);
    if (context instanceof ClientLinker) {
      // TODO: materialize client
    }
    return client;
  }

  public static Client loadClient(ClientContext context) {
    try {
      SwimContext.setClientContext(context);
      final ServiceLoader<Client> clientLoader = ServiceLoader.load(Client.class);
      final Iterator<Client> clients = clientLoader.iterator();
      if (clients.hasNext()) {
        return clients.next();
      }
      return new GenericClient();
    } finally {
      SwimContext.setClientContext(null);
    }
  }

  public static ClientContext loadClientContext() {
    final ServiceLoader<ClientContext> clientContextLoader = ServiceLoader.load(ClientContext.class);
    final Iterator<ClientContext> clientContexts = clientContextLoader.iterator();
    if (clientContexts.hasNext()) {
      return clientContexts.next();
    }
    return null;
  }
}
