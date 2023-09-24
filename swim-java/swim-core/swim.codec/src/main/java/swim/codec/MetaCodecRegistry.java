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
import swim.annotations.Public;
import swim.annotations.Since;
import swim.collections.HashTrieMap;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public class MetaCodecRegistry implements WriteSource {

  HashTrieMap<MediaType, MetaCodec> metaCodecs = HashTrieMap.empty();

  public MetaCodecRegistry() {
    this.metaCodecs = HashTrieMap.empty();
    this.loadIntrinsics();
    this.loadExtensions();
  }

  public final HashTrieMap<MediaType, MetaCodec> metaCodecs() {
    return this.metaCodecs;
  }

  @SuppressWarnings("ReferenceEquality")
  public void addMetaCodec(MediaType mediaType, MetaCodec metaCodec) {
    HashTrieMap<MediaType, MetaCodec> metaCodecs = (HashTrieMap<MediaType, MetaCodec>) META_CODECS.getOpaque(this);
    do {
      final HashTrieMap<MediaType, MetaCodec> oldMetaCodecs = metaCodecs;
      final HashTrieMap<MediaType, MetaCodec> newMetaCodecs = oldMetaCodecs.updated(mediaType, metaCodec);
      metaCodecs = (HashTrieMap<MediaType, MetaCodec>) META_CODECS.compareAndExchangeRelease(this, oldMetaCodecs, newMetaCodecs);
      if (metaCodecs != oldMetaCodecs) {
        // CAS failed; try again.
        continue;
      }
      metaCodecs = newMetaCodecs;
      break;
    } while (true);
  }

  protected void loadIntrinsics() {
    this.addMetaCodec(Binary.APPLICATION_OCTET_STREAM, Binary.metaCodec());

    this.addMetaCodec(Text.TEXT_PLAIN, Text.metaCodec());
    this.addMetaCodec(Text.TEXT_PLAIN.withParam("charset", "utf-8"), Text.metaCodec());
    this.addMetaCodec(Text.TEXT_PLAIN.withParam("charset", "UTF-8"), Text.metaCodec());
  }

  protected void loadExtensions() {
    final ServiceLoader<MetaCodec> serviceLoader = ServiceLoader.load(MetaCodec.class, MetaCodecRegistry.class.getClassLoader());
    final Iterator<ServiceLoader.Provider<MetaCodec>> serviceProviders = serviceLoader.stream().iterator();
    while (serviceProviders.hasNext()) {
      this.loadExtension(serviceProviders.next());
    }
  }

  void loadExtension(ServiceLoader.Provider<MetaCodec> serviceProvider) {
    final Class<? extends MetaCodec> metaCodecClass = serviceProvider.type();
    final CodecType codecTypeAnnotation = metaCodecClass.getAnnotation(CodecType.class);
    if (codecTypeAnnotation == null) {
      return;
    }

    final String[] mediaTypes = codecTypeAnnotation.value();
    if (mediaTypes == null || mediaTypes.length == 0) {
      return;
    }

    MetaCodec metaCodec = null;

    // public static MetaCodec provider(MetaCodecRegistry registry);
    try {
      final Method method = metaCodecClass.getDeclaredMethod("provider", MetaCodecRegistry.class);
      if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
          && Codec.class.isAssignableFrom(method.getReturnType())) {
        metaCodec = (MetaCodec) method.invoke(null, this);
      }
    } catch (ReflectiveOperationException cause) {
      // ignore
    }

    if (metaCodec == null) {
      // public static MetaCodec provider();
      try {
        final Method method = metaCodecClass.getDeclaredMethod("provider");
        if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
            && Codec.class.isAssignableFrom(method.getReturnType())) {
          metaCodec = (MetaCodec) method.invoke(null);
        }
      } catch (ReflectiveOperationException cause) {
        // ignore
      }
    }

    if (metaCodec == null) {
      metaCodec = serviceProvider.get();
    }

    for (int i = 0; i < mediaTypes.length; i += 1) {
      final MediaType mediaType;
      try {
        mediaType = MediaType.parse(mediaTypes[i]).getNonNull();
      } catch (ParseException cause) {
        System.err.println(Notation.of("invalid media type ")
                                   .appendSource(mediaTypes[i])
                                   .append(" for metacodec ")
                                   .append(metaCodecClass.getName())
                                   .toString());
        continue;
      }
      this.addMetaCodec(mediaType, metaCodec);
    }
  }

  public MetaCodec getMetaCodec(MediaType mediaType) throws CodecException {
    final HashTrieMap<MediaType, MetaCodec> metaCodecs = (HashTrieMap<MediaType, MetaCodec>) META_CODECS.getOpaque(this);
    final MetaCodec metaCodec = metaCodecs.get(mediaType);
    if (metaCodec == null) {
      throw new CodecException("no metacodec for media type: " + mediaType);
    }
    return metaCodec;
  }

  public MetaCodec getMetaCodec(String mediaType) throws CodecException {
    return this.getMetaCodec(MediaType.parse(mediaType).getNonNullUnchecked());
  }

  public <T> Codec<T> getCodec(MediaType mediaType, Type type) throws CodecException {
    return this.getMetaCodec(mediaType).getCodec(type);
  }

  public <T> Codec<T> getCodec(String mediaType, Type type) throws CodecException {
    return this.getCodec(MediaType.parse(mediaType).getNonNullUnchecked(), type);
  }

  public MetaFormat getMetaFormat(MediaType mediaType) throws CodecException {
    final HashTrieMap<MediaType, MetaCodec> metaCodecs = (HashTrieMap<MediaType, MetaCodec>) META_CODECS.getOpaque(this);
    final MetaCodec metaCodec = metaCodecs.get(mediaType);
    if (!(metaCodec instanceof MetaFormat)) {
      throw new CodecException("no metaformat for media type: " + mediaType);
    }
    return (MetaFormat) metaCodec;
  }

  public MetaFormat getMetaFormat(String mediaType) throws CodecException {
    return this.getMetaFormat(MediaType.parse(mediaType).getNonNullUnchecked());
  }

  public <T> Format<T> getFormat(MediaType mediaType, Type type) throws CodecException {
    return this.getMetaFormat(mediaType).getFormat(type);
  }

  public <T> Format<T> getFormat(String mediaType, Type type) throws CodecException {
    return this.getFormat(MediaType.parse(mediaType).getNonNullUnchecked(), type);
  }

  public <T> Decode<T> decode(MediaType mediaType, Type type, InputBuffer input) {
    try {
      return this.<T>getCodec(mediaType, type).decode(input);
    } catch (CodecException cause) {
      return Decode.error(cause);
    }
  }

  public <T> Decode<T> decode(MediaType mediaType, Type type) {
    try {
      return this.<T>getCodec(mediaType, type).decode();
    } catch (CodecException cause) {
      return Decode.error(cause);
    }
  }

  public <T> Encode<?> encode(MediaType mediaType, OutputBuffer<?> output, T value) {
    try {
      return this.<T>getCodec(mediaType, value.getClass()).encode(output, value);
    } catch (CodecException cause) {
      return Encode.error(cause);
    }
  }

  public <T> Encode<?> encode(MediaType mediaType, T value) {
    try {
      return this.<T>getCodec(mediaType, value.getClass()).encode(value);
    } catch (CodecException cause) {
      return Encode.error(cause);
    }
  }

  public <T> Parse<T> parse(MediaType mediaType, Type type, Input input) {
    try {
      return this.<T>getFormat(mediaType, type).parse(input);
    } catch (CodecException cause) {
      return Parse.error(cause);
    }
  }

  public <T> Parse<T> parse(MediaType mediaType, Type type) {
    try {
      return this.<T>getFormat(mediaType, type).parse();
    } catch (CodecException cause) {
      return Parse.error(cause);
    }
  }

  public <T> Parse<T> parse(MediaType mediaType, Type type, String string) {
    try {
      return this.<T>getFormat(mediaType, type).parse(string);
    } catch (CodecException cause) {
      return Parse.error(cause);
    }
  }

  public <T> Write<?> write(MediaType mediaType, Output<?> output, T value) {
    try {
      return this.<T>getFormat(mediaType, value.getClass()).write(output, value);
    } catch (CodecException cause) {
      return Write.error(cause);
    }
  }

  public <T> Write<?> write(MediaType mediaType, T value) {
    try {
      return this.<T>getFormat(mediaType, value.getClass()).write(value);
    } catch (CodecException cause) {
      return Write.error(cause);
    }
  }

  public <T> String toString(MediaType mediaType, T value) {
    try {
      return this.<T>getFormat(mediaType, value.getClass()).toString(value);
    } catch (CodecException cause) {
      throw new IllegalArgumentException(Notation.of("no ").append(mediaType)
                                                 .append(" codec for value: ")
                                                 .appendSource(value).toString());
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Codec", "registry").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  /**
   * {@code VarHandle} for atomically accessing the {@link #metaCodecs} field.
   */
  static final VarHandle META_CODECS;

  static final MetaCodecRegistry REGISTRY;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      META_CODECS = lookup.findVarHandle(MetaCodecRegistry.class, "metaCodecs", HashTrieMap.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
    REGISTRY = new MetaCodecRegistry();
  }

}
