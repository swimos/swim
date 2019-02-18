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

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;
import java.util.ServiceLoader;
import swim.api.SwimContext;
import swim.api.plane.Plane;
import swim.api.plane.PlaneException;
import swim.api.router.Router;
import swim.api.server.Server;
import swim.api.server.ServerContext;
import swim.codec.Utf8;
import swim.linker.ServerDef;
import swim.linker.ServerLinker;
import swim.recon.Recon;
import swim.structure.Value;

public final class ServerLoader {
  private ServerLoader() {
    // nop
  }

  public static void main(String[] args) throws IOException {
    final ServerContext server = loadServerContext();
    if (server instanceof ServerLinker) {
      final ServiceLoader<Plane> planeLoader = ServiceLoader.load(Plane.class);
      planeLoader.stream().forEach((ServiceLoader.Provider<Plane> planeProvider) -> {
        try {
          final ServerDef serverDef = loadServerDef(planeProvider.type().getModule());
          ((ServerLinker) server).materialize(serverDef);
        } catch (IOException error) {
          throw new PlaneException(error);
        }
      });
    }

    server.start();
    server.run(); // blocks until termination
  }

  public static Server load(Module module) throws IOException {
    final ServerContext context = loadServerContext();
    final Router router = RouterLoader.loadRouter();
    context.setRouter(router);
    final Server server = loadServer(context);
    if (context instanceof ServerLinker) {
      final ServerDef serverDef = loadServerDef(module);
      ((ServerLinker) context).materialize(serverDef);
    }
    return server;
  }

  public static Server loadServer(ServerContext context) {
    try {
      SwimContext.setServerContext(context);
      final ServiceLoader<Server> serverLoader = ServiceLoader.load(Server.class);
      final Iterator<Server> servers = serverLoader.iterator();
      if (servers.hasNext()) {
        return servers.next();
      }
      return new GenericServer();
    } finally {
      SwimContext.setServerContext(null);
    }
  }

  public static ServerContext loadServerContext() {
    final ServiceLoader<ServerContext> serverContextLoader = ServiceLoader.load(ServerContext.class);
    final Iterator<ServerContext> serverContexts = serverContextLoader.iterator();
    if (serverContexts.hasNext()) {
      return serverContexts.next();
    }
    return null;
  }

  private static ServerDef loadServerDef(Module module) throws IOException {
    final Value configValue = loadConfigValue(module);
    return ServerDef.form().cast(configValue);
  }

  private static Value loadConfigValue(Module module) throws IOException {
    String configPath = System.getProperty("swim.config");
    if (configPath == null) {
      configPath = "/server.recon";
    }

    InputStream configInput = null;
    final Value configValue;
    try {
      final File configFile = new File(configPath);
      if (configFile.exists()) {
        configInput = new FileInputStream(configFile);
      } else {
        configInput = module.getResourceAsStream(configPath);
      }
      if (configInput != null) {
        configValue = Utf8.read(Recon.modelParser().blockParser(), configInput);
      } else {
        configValue = Value.absent();
      }
    } finally {
      try {
        if (configInput != null) {
          configInput.close();
        }
      } catch (IOException swallow) {
      }
    }
    return configValue;
  }
}
