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

package swim.codec;

import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Type;
import java.util.Iterator;
import java.util.ServiceLoader;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.collections.HashTrieMap;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public class CodecRegistry implements ToSource {

  HashTrieMap<MediaType, Codec> codecs = HashTrieMap.empty();

  public CodecRegistry() {
    this.codecs = HashTrieMap.empty();
    this.loadIntrinsics();
    this.loadExtensions();
  }

  public final HashTrieMap<MediaType, Codec> codecs() {
    return this.codecs;
  }

  public @Nullable Codec getCodec(MediaType mediaType) {
    final HashTrieMap<MediaType, Codec> codecs = (HashTrieMap<MediaType, Codec>) CODECS.getOpaque(this);
    return codecs.get(mediaType);
  }

  public @Nullable Codec getCodec(String mediaType) {
    return this.getCodec(MediaType.parse(mediaType));
  }

  public <T> @Nullable Transcoder<T> getTranscoder(MediaType mediaType, Type javaType) {
    final Codec codec = this.getCodec(mediaType);
    if (codec != null) {
      return codec.getTranscoder(javaType);
    } else {
      return null;
    }
  }

  public <T> @Nullable Transcoder<T> getTranscoder(String mediaType, Type javaType) {
    return this.getTranscoder(MediaType.parse(mediaType), javaType);
  }

  public @Nullable Format getFormat(MediaType mediaType) {
    final HashTrieMap<MediaType, Codec> codecs = (HashTrieMap<MediaType, Codec>) CODECS.getOpaque(this);
    final Codec codec = codecs.get(mediaType);
    if (codec instanceof Format) {
      return (Format) codec;
    } else {
      return null;
    }
  }

  public @Nullable Format getFormat(String mediaType) {
    return this.getFormat(MediaType.parse(mediaType));
  }

  public <T> @Nullable Translator<T> getTranslator(MediaType mediaType, Type javaType) {
    final Format format = this.getFormat(mediaType);
    if (format != null) {
      return format.getTranslator(javaType);
    } else {
      return null;
    }
  }

  public <T> @Nullable Translator<T> getTranslator(String mediaType, Type javaType) {
    return this.getTranslator(MediaType.parse(mediaType), javaType);
  }

  @SuppressWarnings("ReferenceEquality")
  public void addCodec(MediaType mediaType, Codec codec) {
    HashTrieMap<MediaType, Codec> codecs = (HashTrieMap<MediaType, Codec>) CODECS.getOpaque(this);
    do {
      final HashTrieMap<MediaType, Codec> oldCodecs = codecs;
      final HashTrieMap<MediaType, Codec> newCodecs = oldCodecs.updated(mediaType, codec);
      codecs = (HashTrieMap<MediaType, Codec>) CODECS.compareAndExchangeRelease(this, oldCodecs, newCodecs);
      if (codecs == oldCodecs) {
        break;
      }
    } while (true);
  }

  protected void loadIntrinsics() {
    this.addCodec(Binary.APPLICATION_OCTET_STREAM, Binary.BYTE_BUFFER_CODEC);

    this.addCodec(Text.TEXT_PLAIN, Text.CODEC);
    this.addCodec(Text.TEXT_PLAIN.withParam("charset", "utf-8"), Text.CODEC);
    this.addCodec(Text.TEXT_PLAIN.withParam("charset", "UTF-8"), Text.CODEC);
  }

  protected void loadExtensions() {
    final ServiceLoader<Codec> serviceLoader = ServiceLoader.load(Codec.class, CodecRegistry.class.getClassLoader());
    final Iterator<ServiceLoader.Provider<Codec>> serviceProviders = serviceLoader.stream().iterator();
    while (serviceProviders.hasNext()) {
      final ServiceLoader.Provider<Codec> serviceProvider = serviceProviders.next();
      final Class<? extends Codec> codecClass = serviceProvider.type();
      final CodecType codecTypeAnnotation = codecClass.getAnnotation(CodecType.class);
      if (codecTypeAnnotation != null) {
        final String[] mediaTypes = codecTypeAnnotation.value();
        if (mediaTypes != null && mediaTypes.length != 0) {
          Codec codec = null;

          // public static Codec provider(CodecRegistry registry);
          try {
            final Method method = codecClass.getDeclaredMethod("provider", CodecRegistry.class);
            if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
                && Codec.class.isAssignableFrom(method.getReturnType())) {
              codec = (Codec) method.invoke(null, this);
            }
          } catch (ReflectiveOperationException cause) {
            // swallow
          }

          if (codec == null) {
            // public static Codec provider();
            try {
              final Method method = codecClass.getDeclaredMethod("provider");
              if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
                  && Codec.class.isAssignableFrom(method.getReturnType())) {
                codec = (Codec) method.invoke(null);
              }
            } catch (ReflectiveOperationException cause) {
              // swallow
            }
          }

          if (codec == null) {
            codec = serviceProvider.get();
          }

          for (int i = 0; i < mediaTypes.length; i += 1) {
            final MediaType mediaType = MediaType.parse(mediaTypes[i]);
            this.addCodec(mediaType, codec);
          }
        }
      }
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Codec", "registry").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  /**
   * {@code VarHandle} for atomically accessing the {@link #codecs} field.
   */
  static final VarHandle CODECS;

  static final CodecRegistry REGISTRY;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      CODECS = lookup.findVarHandle(CodecRegistry.class, "codecs", HashTrieMap.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
    REGISTRY = new CodecRegistry();
  }

}
