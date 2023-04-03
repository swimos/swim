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
      this.loadExtension(serviceProviders.next());
    }
  }

  void loadExtension(ServiceLoader.Provider<Codec> serviceProvider) {
    final Class<? extends Codec> codecClass = serviceProvider.type();
    final CodecType codecTypeAnnotation = codecClass.getAnnotation(CodecType.class);
    if (codecTypeAnnotation == null) {
      return;
    }

    final String[] mediaTypes = codecTypeAnnotation.value();
    if (mediaTypes == null || mediaTypes.length == 0) {
      return;
    }

    Codec codec = null;

    // public static Codec provider(CodecRegistry registry);
    try {
      final Method method = codecClass.getDeclaredMethod("provider", CodecRegistry.class);
      if ((method.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
          && Codec.class.isAssignableFrom(method.getReturnType())) {
        codec = (Codec) method.invoke(null, this);
      }
    } catch (ReflectiveOperationException cause) {
      // ignore
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
        // ignore
      }
    }

    if (codec == null) {
      codec = serviceProvider.get();
    }

    for (int i = 0; i < mediaTypes.length; i += 1) {
      final MediaType mediaType;
      try {
        mediaType = MediaType.parse(mediaTypes[i]).getNonNull();
      } catch (ParseException cause) {
        System.err.println(Notation.of("invalid media type ")
                                   .appendSource(mediaTypes[i])
                                   .append(" for codec ")
                                   .append(codecClass.getName())
                                   .toString());
        continue;
      }
      this.addCodec(mediaType, codec);
    }
  }

  public Codec getCodec(MediaType mediaType) throws CodecException {
    final HashTrieMap<MediaType, Codec> codecs = (HashTrieMap<MediaType, Codec>) CODECS.getOpaque(this);
    final Codec codec = codecs.get(mediaType);
    if (codec != null) {
      return codec;
    } else {
      throw new CodecException("no codec for media type: " + mediaType);
    }
  }

  public Codec getCodec(String mediaType) throws CodecException {
    return this.getCodec(MediaType.parse(mediaType).getNonNullUnchecked());
  }

  public <T> Transcoder<T> getTranscoder(MediaType mediaType, Type javaType)
      throws CodecException, TranscoderException {
    final Codec codec = this.getCodec(mediaType);
    return codec.getTranscoder(javaType);
  }

  public <T> Transcoder<T> getTranscoder(String mediaType, Type javaType)
      throws CodecException, TranscoderException {
    return this.getTranscoder(MediaType.parse(mediaType).getNonNullUnchecked(), javaType);
  }

  public Format getFormat(MediaType mediaType) throws FormatException {
    final HashTrieMap<MediaType, Codec> codecs = (HashTrieMap<MediaType, Codec>) CODECS.getOpaque(this);
    final Codec codec = codecs.get(mediaType);
    if (codec instanceof Format) {
      return (Format) codec;
    } else {
      throw new FormatException("no format for media type: " + mediaType);
    }
  }

  public Format getFormat(String mediaType) throws FormatException {
    return this.getFormat(MediaType.parse(mediaType).getNonNullUnchecked());
  }

  public <T> Translator<T> getTranslator(MediaType mediaType, Type javaType)
      throws FormatException, TranslatorException {
    final Format format = this.getFormat(mediaType);
    return format.getTranslator(javaType);
  }

  public <T> Translator<T> getTranslator(String mediaType, Type javaType)
      throws FormatException, TranslatorException {
    return this.getTranslator(MediaType.parse(mediaType).getNonNullUnchecked(), javaType);
  }

  public <T> Decode<T> decode(MediaType mediaType, Type javaType, InputBuffer input) {
    try {
      return this.<T>getTranscoder(mediaType, javaType).decode(input);
    } catch (CodecException cause) {
      return Decode.error(cause);
    }
  }

  public <T> Decode<T> decode(MediaType mediaType, Type javaType) {
    try {
      return this.<T>getTranscoder(mediaType, javaType).decode();
    } catch (CodecException cause) {
      return Decode.error(cause);
    }
  }

  public <T> Encode<?> encode(MediaType mediaType, OutputBuffer<?> output, T value) {
    try {
      return this.<T>getTranscoder(mediaType, value.getClass()).encode(output, value);
    } catch (CodecException cause) {
      return Encode.error(cause);
    }
  }

  public <T> Encode<?> encode(MediaType mediaType, T value) {
    try {
      return this.<T>getTranscoder(mediaType, value.getClass()).encode(value);
    } catch (CodecException cause) {
      return Encode.error(cause);
    }
  }

  public <T> Parse<T> parse(MediaType mediaType, Type javaType, Input input) {
    try {
      return this.<T>getTranslator(mediaType, javaType).parse(input);
    } catch (FormatException | TranslatorException cause) {
      return Parse.error(cause);
    }
  }

  public <T> Parse<T> parse(MediaType mediaType, Type javaType) {
    try {
      return this.<T>getTranslator(mediaType, javaType).parse();
    } catch (FormatException | TranslatorException cause) {
      return Parse.error(cause);
    }
  }

  public <T> Parse<T> parse(MediaType mediaType, Type javaType, String string) {
    try {
      return this.<T>getTranslator(mediaType, javaType).parse(string);
    } catch (FormatException | TranslatorException cause) {
      return Parse.error(cause);
    }
  }

  public <T> Write<?> write(MediaType mediaType, Output<?> output, T value) {
    try {
      return this.<T>getTranslator(mediaType, value.getClass()).write(output, value);
    } catch (FormatException | TranslatorException cause) {
      return Write.error(cause);
    }
  }

  public <T> Write<?> write(MediaType mediaType, T value) {
    try {
      return this.<T>getTranslator(mediaType, value.getClass()).write(value);
    } catch (FormatException | TranslatorException cause) {
      return Write.error(cause);
    }
  }

  public <T> String toString(MediaType mediaType, T value) {
    try {
      return this.<T>getTranslator(mediaType, value.getClass()).toString(value);
    } catch (FormatException cause) {
      throw new IllegalArgumentException("no format for media type: " + mediaType);
    } catch (TranslatorException cause) {
      throw new IllegalArgumentException(Notation.of("no ").append(mediaType)
                                                 .append(" translator for value: ")
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
