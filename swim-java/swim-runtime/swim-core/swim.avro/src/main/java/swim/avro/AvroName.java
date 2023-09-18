// Copyright 2015-2023 Nstream, inc.
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

package swim.avro;

import swim.codec.Debug;
import swim.codec.Diagnostic;
import swim.codec.Display;
import swim.codec.Format;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.util.HashGenCacheSet;
import swim.util.Murmur3;

public final class AvroName implements Comparable<AvroName>, Debug, Display {

  final AvroNamespace namespace;
  final String name;
  String string;

  public AvroName(AvroNamespace namespace, String name) {
    this.namespace = namespace;
    this.name = name;
  }

  public AvroNamespace namespace() {
    return this.namespace;
  }

  public String name() {
    return this.name;
  }

  @Override
  public int compareTo(AvroName that) {
    return this.toString().compareTo(that.toString());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof AvroName) {
      final AvroName that = (AvroName) other;
      return this.toString().equals(that.toString());
    }
    return false;
  }

  @Override
  public int hashCode() {
    return Murmur3.seed(this.toString());
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("AvroName").write('.').write("parse").write('(').write('"')
                   .display(this).write('"').write(')');
    return output;
  }

  @Override
  public <T> Output<T> display(Output<T> output) {
    if (this.string != null) {
      output = output.write(this.string);
    } else {
      if (this.namespace.isDefined()) {
        output = this.namespace.display(output);
        output = output.write('.');
      }
      output = output.write(this.name);
    }
    return output;
  }

  @Override
  public String toString() {
    if (this.string == null) {
      this.string = Format.display(this);
    }
    return this.string;
  }

  public static AvroName create(AvroNamespace namespace, String name) {
    if (namespace == null) {
      throw new NullPointerException("namespace");
    }
    name = AvroName.cacheName(name);
    return new AvroName(namespace, name);
  }

  public static AvroName create(String name) {
    name = AvroName.cacheName(name);
    return new AvroName(AvroNamespace.empty(), name);
  }

  public static AvroName parse(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<AvroName> parser = AvroNameParser.parse(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }

  private static ThreadLocal<HashGenCacheSet<String>> nameCache = new ThreadLocal<>();

  static HashGenCacheSet<String> nameCache() {
    HashGenCacheSet<String> nameCache = AvroName.nameCache.get();
    if (nameCache == null) {
      int nameCacheSize;
      try {
        nameCacheSize = Integer.parseInt(System.getProperty("swim.avro.name.cache.size"));
      } catch (NumberFormatException e) {
        nameCacheSize = 16;
      }
      nameCache = new HashGenCacheSet<String>(nameCacheSize);
      AvroName.nameCache.set(nameCache);
    }
    return nameCache;
  }

  static String cacheName(String name) {
    if (name.length() <= 32) {
      return AvroName.nameCache().put(name);
    } else {
      return name;
    }
  }

}
