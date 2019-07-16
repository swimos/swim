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

package swim.io;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.security.KeyStore;
import java.security.SecureRandom;
import java.util.Collection;
import javax.net.ssl.KeyManager;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.collections.FingerTrieSeq;
import swim.structure.Form;
import swim.structure.FormException;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

/**
 * TLS configuration parameters.
 */
public class TlsSettings implements Debug {
  protected final SSLContext sslContext;
  protected final ClientAuth clientAuth;
  protected final Collection<String> cipherSuites;
  protected final Collection<String> protocols;

  public TlsSettings(SSLContext sslContext, ClientAuth clientAuth,
                     Collection<String> cipherSuites,
                     Collection<String> protocols) {
    this.sslContext = sslContext;
    this.clientAuth = clientAuth;
    this.cipherSuites = cipherSuites;
    this.protocols = protocols;
  }

  /**
   * Returns the factory used to create secure sockets.
   */
  public final SSLContext sslContext() {
    return this.sslContext;
  }

  /**
   * Returns a copy of these {@code TlsSettings} configured with the given
   * {@code sslContext} for creating secure sockets.
   */
  public TlsSettings sslContext(SSLContext sslContext) {
    return copy(sslContext, this.clientAuth, this.cipherSuites, this.protocols);
  }

  /**
   * Returns the authentication requirement for incoming connections.
   */
  public final ClientAuth clientAuth() {
    return this.clientAuth;
  }

  /**
   * Returns a copy of these {@code TlsSettings} configured with the given
   * {@code clientAuth} authentication requirement for incoming connections.
   */
  public TlsSettings clientAuth(ClientAuth clientAuth) {
    return copy(this.sslContext, clientAuth, this.cipherSuites, this.protocols);
  }

  /**
   * Returns the set of permitted cipher suites for secure socket connections,
   * or {@code null} if the system defaults should be used.
   */
  public final Collection<String> cipherSuites() {
    return this.cipherSuites;
  }

  /**
   * Returns a copy of these {@code TlsSettings} configured with the given set
   * of {@code cipherSuites}; {@code cipherSuites} may be {@code null} if the
   * system defaults should be used.
   */
  public TlsSettings cipherSuites(Collection<String> cipherSuites) {
    return copy(this.sslContext, this.clientAuth, cipherSuites, this.protocols);
  }

  /**
   * Returns the set of permitted secure socket layer protocols, or {@code
   * null} if the system defaults should be used.
   */
  public final Collection<String> protocols() {
    return this.protocols;
  }

  /**
   * Returns a copy of these {@code TlsSettings} configured with the given set
   * of {@code protocols}; {@code protocols} may be {@code null} if the system
   * defaults should be used.
   */
  public TlsSettings protocols(Collection<String> protocols) {
    return copy(this.sslContext, this.clientAuth, this.cipherSuites, protocols);
  }

  /**
   * Returns a new {@code TlsSettings} instance with the given options.
   * Subclasses may override this method to ensure the proper class is
   * instantiated when updating settings.
   */
  protected TlsSettings copy(SSLContext sslContext, ClientAuth clientAuth,
                             Collection<String> cipherSuites,
                             Collection<String> protocols) {
    return new TlsSettings(sslContext, clientAuth, cipherSuites, protocols);
  }

  /**
   * Returns a structural {@code Value} representing these {@code TlsSettings}.
   */
  public Value toValue() {
    return form().mold(this).toValue();
  }

  /**
   * Returns {@code true} if these {@code TlsSettings} can possibly equal some
   * {@code other} object.
   */
  public boolean canEqual(Object other) {
    return other instanceof TlsSettings;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof TlsSettings) {
      final TlsSettings that = (TlsSettings) other;
      return that.canEqual(this)
          && (this.sslContext == null ? that.sslContext == null : this.sslContext.equals(that.sslContext))
          && this.clientAuth.equals(that.clientAuth)
          && (this.cipherSuites == null ? that.cipherSuites == null : this.cipherSuites.equals(that.cipherSuites))
          && (this.protocols == null ? that.protocols == null : this.protocols.equals(that.protocols));
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(TlsSettings.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.sslContext)), this.clientAuth.hashCode()),
        Murmur3.hash(this.cipherSuites)), Murmur3.hash(this.protocols)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("TlsSettings").write('.').write("standard").write('(').write(')')
        .write('.').write("sslContext").write('(').debug(this.sslContext).write(')')
        .write('.').write("clientAuth").write('(').debug(this.clientAuth).write(')')
        .write('.').write("cipherSuites").write('(').debug(this.cipherSuites).write(')')
        .write('.').write("protocols").write('(').debug(this.protocols).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static TlsSettings standard;

  private static Form<TlsSettings> form;

  public static TlsSettings create(ClientAuth clientAuth,
                                   Collection<String> cipherSuites,
                                   Collection<String> protocols) {
    try {
      final String tlsProtocol = System.getProperty("swim.tls.protocol", "TLS");
      final String tlsProvider = System.getProperty("swim.tls.provider");
      final String tlsRandom = System.getProperty("swim.tls.random");
      final SecureRandom random;
      if (tlsRandom != null) {
        random = SecureRandom.getInstance(tlsRandom);
      } else {
        random = new SecureRandom();
      }
      final SSLContext sslContext;
      if (tlsProvider != null) {
        sslContext = SSLContext.getInstance(tlsProtocol, tlsProvider);
      } else {
        sslContext = SSLContext.getInstance(tlsProtocol);
      }
      final KeyManager[] keyManagers = loadKeyManagers();
      final TrustManager[] trustManagers = loadTrustManagers();
      sslContext.init(keyManagers, trustManagers, random);
      return new TlsSettings(sslContext, clientAuth, cipherSuites, protocols);
    } catch (GeneralSecurityException cause) {
      return null;
    }
  }

  /**
   * Returns the default {@code TlsSettings} instance.
   */
  public static TlsSettings standard() {
    if (standard == null) {
      ClientAuth clientAuth;
      try {
        clientAuth = ClientAuth.from(System.getProperty("swim.tls.client.auth"));
      } catch (IllegalArgumentException swallow) {
        clientAuth = ClientAuth.NONE;
      }
      FingerTrieSeq<String> cipherSuites;
      try {
        cipherSuites = FingerTrieSeq.of(System.getProperty("swim.tls.ciphersuites").split(","));
      } catch (NullPointerException cause) {
        cipherSuites = null;
      }
      FingerTrieSeq<String> protocols;
      try {
        protocols = FingerTrieSeq.of(System.getProperty("swim.tls.protocols").split(","));
      } catch (NullPointerException cause) {
        protocols = null;
      }
      standard = create(clientAuth, cipherSuites, protocols);
    }
    return standard;
  }

  /**
   * Returns the structural {@code Form} of {@code TlsSettings}.
   */
  @Kind
  public static Form<TlsSettings> form() {
    if (form == null) {
      form = new TlsSettingsForm();
    }
    return form;
  }

  static KeyManager[] loadKeyManagers() {
    final String path = System.getProperty("swim.tls.keystore.path");
    final String resource = System.getProperty("swim.tls.keystore.resource");
    if (path != null || resource != null) {
      final String type = System.getProperty("swim.tls.keystore.type", KeyStore.getDefaultType());
      final String provider = System.getProperty("swim.tls.keystore.provider");
      final String password = System.getProperty("swim.tls.keystore.password");
      final char[] passwordChars = password != null ? password.toCharArray() : null;
      InputStream inputStream = null;
      try {
        final KeyStore keyStore;
        final KeyManagerFactory keyManagerFactory;
        if (provider != null) {
          keyStore = KeyStore.getInstance(type, provider);
          keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm(), provider);
        } else {
          keyStore = KeyStore.getInstance(type);
          keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
        }
        if (path != null) {
          inputStream = new FileInputStream(path);
        } else if (resource != null) {
          inputStream = ClassLoader.getSystemResourceAsStream(resource);
          if (inputStream == null) {
            throw new RuntimeException("Missing swim.tls.keystore.resource: " + resource);
          }
        }
        keyStore.load(inputStream, passwordChars);
        keyManagerFactory.init(keyStore, passwordChars);
        return keyManagerFactory.getKeyManagers();
      } catch (GeneralSecurityException | IOException cause) {
        throw new RuntimeException(cause);
      } finally {
        try {
          if (inputStream != null) {
            inputStream.close();
          }
        } catch (IOException cause) {
          throw new RuntimeException(cause);
        }
      }
    }
    return null;
  }

  static TrustManager[] loadTrustManagers() {
    final String path = System.getProperty("swim.tls.truststore.path");
    final String resource = System.getProperty("swim.tls.truststore.resource");
    if (path != null || resource != null) {
      final String type = System.getProperty("swim.tls.truststore.type", KeyStore.getDefaultType());
      final String provider = System.getProperty("swim.tls.truststore.provider");
      final String password = System.getProperty("swim.tls.truststore.password");
      final char[] passwordChars = password != null ? password.toCharArray() : null;
      InputStream inputStream = null;
      try {
        final KeyStore trustStore;
        final TrustManagerFactory trustManagerFactory;
        if (provider != null) {
          trustStore = KeyStore.getInstance(type, provider);
          trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm(), provider);
        } else {
          trustStore = KeyStore.getInstance(type);
          trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        }
        if (path != null) {
          inputStream = new FileInputStream(path);
        } else if (resource != null) {
          inputStream = ClassLoader.getSystemResourceAsStream(resource);
          if (inputStream == null) {
            throw new RuntimeException("Missing swim.tls.truststore.resource: " + resource);
          }
        }
        trustStore.load(inputStream, passwordChars);
        trustManagerFactory.init(trustStore);
        return trustManagerFactory.getTrustManagers();
      } catch (GeneralSecurityException | IOException cause) {
        throw new RuntimeException(cause);
      } finally {
        try {
          if (inputStream != null) {
            inputStream.close();
          }
        } catch (IOException cause) {
          throw new RuntimeException(cause);
        }
      }
    }
    return null;
  }
}

final class TlsSettingsForm extends Form<TlsSettings> {
  @Override
  public String tag() {
    return "tls";
  }

  @Override
  public Class<?> type() {
    return TlsSettings.class;
  }

  @Override
  public Item mold(TlsSettings settings) {
    if (settings != null) {
      final Record header = Record.create(2)
          .slot("protocol", settings.sslContext.getProtocol())
          .slot("provider", settings.sslContext.getProvider().getName());
      final Record record = Record.create(4).attr(tag(), header);

      if (settings.clientAuth != ClientAuth.NONE) {
        record.slot("clientAuth", ClientAuth.form().mold(settings.clientAuth).toValue());
      }

      if (settings.cipherSuites != null) {
        final Record cipherSuites = Record.create(settings.cipherSuites.size());
        for (String cipherSuite : settings.cipherSuites) {
          cipherSuites.item(cipherSuite);
        }
        record.slot("cipherSuites", cipherSuites);
      }

      if (settings.protocols != null) {
        final Record protocols = Record.create(settings.protocols.size());
        for (String protocol : settings.protocols) {
          protocols.item(protocol);
        }
        record.slot("protocols", protocols);
      }

      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public TlsSettings cast(Item item) {
    final Value value = item.toValue();
    final Value header = value.getAttr(tag());
    if (header.isDefined()) {
      final String tlsProtocol = header.get("protocol").stringValue(System.getProperty("swim.tls.protocol", "TLS"));
      final String tlsProvider = header.get("provider").stringValue(System.getProperty("swim.tls.provider"));
      final String tlsRandom = header.get("random").stringValue(System.getProperty("swim.tls.random"));

      KeyManager[] keyManagers = TlsSettings.loadKeyManagers();
      TrustManager[] trustManagers = TlsSettings.loadTrustManagers();
      for (Item member : value) {
        final KeyManagerFactory keyManagerFactory = castKeyManagerFactory(member.toValue());
        if (keyManagerFactory != null) {
          if (keyManagers == null) {
            keyManagers = keyManagerFactory.getKeyManagers();
          } else {
            final KeyManager[] newKeyManagers = keyManagerFactory.getKeyManagers();
            if (newKeyManagers != null && newKeyManagers.length > 0) {
              final KeyManager[] oldKeyManagers = keyManagers;
              keyManagers = new KeyManager[oldKeyManagers.length + newKeyManagers.length];
              System.arraycopy(oldKeyManagers, 0, keyManagers, 0, oldKeyManagers.length);
              System.arraycopy(newKeyManagers, 0, keyManagers, oldKeyManagers.length, newKeyManagers.length);
            }
          }
        }

        final TrustManagerFactory trustManagerFactory = castTrustManagerFactory(member.toValue());
        if (trustManagerFactory != null) {
          if (trustManagers == null) {
            trustManagers = trustManagerFactory.getTrustManagers();
          } else {
            final TrustManager[] newTrustManagers = trustManagerFactory.getTrustManagers();
            if (newTrustManagers != null && newTrustManagers.length > 0) {
              final TrustManager[] oldTrustManagers = trustManagers;
              trustManagers = new TrustManager[oldTrustManagers.length + newTrustManagers.length];
              System.arraycopy(oldTrustManagers, 0, trustManagers, 0, oldTrustManagers.length);
              System.arraycopy(newTrustManagers, 0, trustManagers, oldTrustManagers.length, newTrustManagers.length);
            }
          }
        }
      }

      final SSLContext sslContext;
      try {
        final SecureRandom random;
        if (tlsRandom != null) {
          random = SecureRandom.getInstance(tlsRandom);
        } else {
          random = new SecureRandom();
        }
        if (tlsProvider != null) {
          sslContext = SSLContext.getInstance(tlsProtocol, tlsProvider);
        } else {
          sslContext = SSLContext.getInstance(tlsProtocol);
        }
        sslContext.init(keyManagers, trustManagers, random);
      } catch (GeneralSecurityException cause) {
        throw new IpException(cause);
      }

      ClientAuth clientAuth = ClientAuth.form().cast(value.get("clientAuth"));
      if (clientAuth == null) {
        try {
          clientAuth = ClientAuth.from(System.getProperty("swim.tls.client.auth"));
        } catch (IllegalArgumentException swallow) {
          clientAuth = ClientAuth.NONE;
        }
      }

      FingerTrieSeq<String> cipherSuites;
      if (value.containsKey("cipherSuites")) {
        cipherSuites = FingerTrieSeq.empty();
        for (Item cipherSuite : value.get("cipherSuites")) {
          cipherSuites = cipherSuites.appended(cipherSuite.stringValue());
        }
      } else {
        try {
          cipherSuites = FingerTrieSeq.of(System.getProperty("swim.tls.ciphersuites").split(","));
        } catch (NullPointerException cause) {
          cipherSuites = null;
        }
      }

      FingerTrieSeq<String> protocols;
      if (value.containsKey("protocols")) {
        protocols = FingerTrieSeq.empty();
        for (Item protocol : value.get("protocols")) {
          protocols = protocols.appended(protocol.stringValue());
        }
      } else {
        try {
          protocols = FingerTrieSeq.of(System.getProperty("swim.tls.protocols").split(","));
        } catch (NullPointerException cause) {
          protocols = null;
        }
      }

      return new TlsSettings(sslContext, clientAuth, cipherSuites, protocols);
    }
    return null;
  }

  private KeyManagerFactory castKeyManagerFactory(Value value) {
    final Value header = value.getAttr("keyStore");
    if (header.isDefined()) {
      final String type = header.get("type").stringValue(KeyStore.getDefaultType());
      final String provider = header.get("provider").stringValue(null);

      final KeyStore keyStore;
      final KeyManagerFactory keyManagerFactory;
      try {
        if (provider != null) {
          keyStore = KeyStore.getInstance(type, provider);
          keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm(), provider);
        } else {
          keyStore = KeyStore.getInstance(type);
          keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
        }
      } catch (GeneralSecurityException cause) {
        throw new IpException(cause);
      }

      final String path = value.get("path").stringValue(null);
      final String resource = value.get("resource").stringValue(null);
      final String password = value.get("password").stringValue(null);
      final char[] passwordChars = password != null ? password.toCharArray() : null;

      InputStream inputStream = null;
      try {
        if (path != null) {
          inputStream = new FileInputStream(path);
        } else if (resource != null) {
          inputStream = Thread.currentThread().getContextClassLoader().getResourceAsStream(resource);
          if (inputStream == null) {
            throw new FormException("Missing keystore resource: " + resource);
          }
        }
        keyStore.load(inputStream, passwordChars);
        keyManagerFactory.init(keyStore, passwordChars);
        return keyManagerFactory;
      } catch (GeneralSecurityException cause) {
        throw new IpException(cause);
      } catch (IOException cause) {
        throw new FormException(cause);
      } finally {
        if (inputStream != null) {
          try {
            inputStream.close();
          } catch (IOException cause) {
            throw new FormException(cause);
          }
        }
      }
    }
    return null;
  }

  private TrustManagerFactory castTrustManagerFactory(Value value) {
    final Value header = value.getAttr("trustStore");
    if (header.isDefined()) {
      final String type = header.get("type").stringValue(KeyStore.getDefaultType());
      final String provider = header.get("provider").stringValue(null);

      final KeyStore trustStore;
      final TrustManagerFactory trustManagerFactory;
      try {
        if (provider != null) {
          trustStore = KeyStore.getInstance(type, provider);
          trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm(), provider);
        } else {
          trustStore = KeyStore.getInstance(type);
          trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        }
      } catch (GeneralSecurityException cause) {
        throw new IpException(cause);
      }

      final String path = value.get("path").stringValue(null);
      final String resource = value.get("resource").stringValue(null);
      final String password = value.get("password").stringValue(null);
      final char[] passwordChars = password != null ? password.toCharArray() : null;

      InputStream inputStream = null;
      try {
        if (path != null) {
          inputStream = new FileInputStream(path);
        } else if (resource != null) {
          inputStream = Thread.currentThread().getContextClassLoader().getResourceAsStream(resource);
          if (inputStream == null) {
            throw new FormException("Missing truststore resource: " + resource);
          }
        }
        trustStore.load(inputStream, passwordChars);
        trustManagerFactory.init(trustStore);
        return trustManagerFactory;
      } catch (GeneralSecurityException cause) {
        throw new IpException(cause);
      } catch (IOException cause) {
        throw new FormException(cause);
      } finally {
        if (inputStream != null) {
          try {
            inputStream.close();
          } catch (IOException cause) {
            throw new FormException(cause);
          }
        }
      }
    }
    return null;
  }
}
