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

package swim.kernel;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import swim.codec.Utf8;
import swim.recon.Recon;
import swim.structure.Item;
import swim.structure.Value;

public final class KernelLoader {
  private KernelLoader() {
    // static
  }

  public static Kernel loadKernel() {
    return loadKernel(KernelLoader.class.getClassLoader());
  }

  public static Kernel loadKernel(ClassLoader classLoader) {
    try {
      Value kernelConfig = loadConfig(classLoader);
      if (kernelConfig == null) {
        kernelConfig = Value.absent();
      }
      return loadKernelStack(classLoader, kernelConfig);
    } catch (IOException cause) {
      throw new KernelException(cause);
    }
  }

  public static Kernel loadKernelStack(ClassLoader classLoader, Value kernelConfig) {
    Kernel kernelStack = null;
    for (int i = 0, n = kernelConfig.length(); i < n; i += 1) {
      final Item moduleConfig = kernelConfig.getItem(i);
      final Kernel kernelModule = loadKernelModule(classLoader, moduleConfig.toValue());
      if (kernelModule != null) {
        kernelStack = kernelStack == null ? kernelModule : kernelStack.injectKernel(kernelModule);
      }
    }
    return kernelStack;
  }

  @SuppressWarnings("unchecked")
  public static Kernel loadKernelModule(ClassLoader classLoader, Value moduleConfig) {
    Kernel kernel = null;
    final Value header = moduleConfig.getAttr("kernel");
    final String kernelClassName = header.get("class").stringValue(null);
    if (kernelClassName != null) {
      try {
        final Class<? extends Kernel> kernelClass = (Class<? extends Kernel>) Class.forName(kernelClassName, true, classLoader);
        try {
          final Method kernelFromValueMethod = kernelClass.getMethod("fromValue", Value.class);
          if ((kernelFromValueMethod.getModifiers() & Modifier.STATIC) != 0) {
            kernelFromValueMethod.setAccessible(true);
            kernel = (Kernel) kernelFromValueMethod.invoke(null, moduleConfig);
          }
        } catch (NoSuchMethodException swallow) {
          // continue
        }
        if (kernel == null) {
          final Constructor<? extends Kernel> kernelConstructor = kernelClass.getConstructor();
          kernelConstructor.setAccessible(true);
          kernel = kernelConstructor.newInstance();
        }
      } catch (ReflectiveOperationException cause) {
        if (!header.get("optional").booleanValue(false)) {
          throw new KernelException("failed to load required kernel class: " + kernelClassName, cause);
        }
      }
    }
    return kernel;
  }

  public static Value loadConfig() throws IOException {
    return loadConfig(KernelLoader.class.getClassLoader());
  }

  public static Value loadConfig(ClassLoader classLoader) throws IOException {
    Value configValue = loadConfigFile();
    if (configValue == null) {
      configValue = loadConfigResource(classLoader);
    }
    return configValue;
  }

  public static Value loadConfigFile() throws IOException {
    Value configValue = null;
    String configPath = System.getProperty("swim.config.file");
    if (configPath == null) {
      configPath = System.getProperty("swim.config");
    }
    if (configPath != null) {
      final File configFile = new File(configPath);
      if (configFile.exists()) {
        configValue = loadConfigFile(configFile);
      }
    }
    return configValue;
  }

  public static Value loadConfigFile(File configFile) throws IOException {
    Value configValue = null;
    FileInputStream configInput = null;
    try {
      configInput = new FileInputStream(configFile);
      if (configInput != null) {
        configValue = parseConfigValue(configInput);
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

  public static Value loadConfigResource(ClassLoader classLoader) throws IOException {
    Value configValue = null;
    String configResource = System.getProperty("swim.config.resource");
    if (configResource == null) {
      configResource = System.getProperty("swim.config");
    }
    if (configResource != null) {
      configValue = loadConfigResource(classLoader, configResource);
    }
    return configValue;
  }

  public static Value loadConfigResource(ClassLoader classLoader, String configResource) throws IOException {
    Value configValue = null;
    InputStream configInput = null;
    try {
      configInput = classLoader.getResourceAsStream(configResource);
      if (configInput != null) {
        configValue = parseConfigValue(configInput);
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

  public static Value parseConfigValue(InputStream configInput) throws IOException {
    return Utf8.read(Recon.structureParser().blockParser(), configInput);
  }
}
