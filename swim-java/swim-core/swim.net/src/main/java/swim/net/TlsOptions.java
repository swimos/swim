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

package swim.net;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.security.KeyStore;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.MissingResourceException;
import java.util.Objects;
import javax.net.ssl.KeyManager;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLEngine;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

/**
 * TLS configuration options.
 */
@Public
@Since("5.0")
public class TlsOptions implements WriteSource {

  protected final SSLContext sslContext;
  protected final TlsClientAuth clientAuth;
  protected final @Nullable Collection<String> protocols;
  protected final @Nullable Collection<String> cipherSuites;

  public TlsOptions(SSLContext sslContext,
                    TlsClientAuth clientAuth,
                    @Nullable Collection<String> protocols,
                    @Nullable Collection<String> cipherSuites) {
    this.sslContext = sslContext;
    this.clientAuth = clientAuth;
    this.protocols = protocols;
    this.cipherSuites = cipherSuites;
  }

  /**
   * Returns the factory used to create secure sockets.
   */
  public final SSLContext sslContext() {
    return this.sslContext;
  }

  /**
   * Returns a copy of these options configured with the given
   * {@code sslContext} for creating secure sockets.
   */
  public TlsOptions sslContext(SSLContext sslContext) {
    return this.copy(sslContext, this.clientAuth, this.protocols, this.cipherSuites);
  }

  /**
   * Returns the authentication requirement for incoming connections.
   */
  public final TlsClientAuth clientAuth() {
    return this.clientAuth;
  }

  /**
   * Returns a copy of these options configured with the given
   * {@code clientAuth} authentication requirement for incoming connections.
   */
  public TlsOptions clientAuth(TlsClientAuth clientAuth) {
    return this.copy(this.sslContext, clientAuth, this.protocols, this.cipherSuites);
  }

  /**
   * Returns the set of permitted secure socket layer protocols,
   * or {@code null} if the system defaults should be used.
   */
  public final @Nullable Collection<String> protocols() {
    return this.protocols;
  }

  /**
   * Returns a copy of these options configured with the given set of
   * {@code protocols}; {@code protocols} may be {@code null} if the
   * system defaults should be used.
   */
  public TlsOptions protocols(@Nullable Collection<String> protocols) {
    return this.copy(this.sslContext, this.clientAuth, protocols, this.cipherSuites);
  }

  /**
   * Returns the set of permitted cipher suites for secure socket connections,
   * or {@code null} if the system defaults should be used.
   */
  public final @Nullable Collection<String> cipherSuites() {
    return this.cipherSuites;
  }

  /**
   * Returns a copy of these options configured with the given set of
   * {@code cipherSuites}; {@code cipherSuites} may be {@code null} if
   * the system defaults should be used.
   */
  public TlsOptions cipherSuites(@Nullable Collection<String> cipherSuites) {
    return this.copy(this.sslContext, this.clientAuth, this.protocols, cipherSuites);
  }

  /**
   * Returns a copy of these options with the specified TLS options.
   * Subclasses may override this method to ensure the proper class is
   * instantiated when updating options.
   */
  protected TlsOptions copy(SSLContext sslContext,
                            TlsClientAuth clientAuth,
                            @Nullable Collection<String> protocols,
                            @Nullable Collection<String> cipherSuites) {
    return new TlsOptions(sslContext, clientAuth, protocols, cipherSuites);
  }

  /**
   * Returns a new {@code SSLEngine} configured with these TLS options.
   */
  public SSLEngine createSSLEngine() {
    final SSLEngine sslEngine = this.sslContext.createSSLEngine();
    switch (this.clientAuth) {
      case NEED: sslEngine.setNeedClientAuth(true); break;
      case WANT: sslEngine.setWantClientAuth(true); break;
      case NONE: sslEngine.setWantClientAuth(false); break;
      default:
    }
    final Collection<String> protocols = this.protocols;
    if (protocols != null) {
      sslEngine.setEnabledProtocols(protocols.toArray(new String[protocols.size()]));
    }
    final Collection<String> cipherSuites = this.cipherSuites;
    if (cipherSuites != null) {
      sslEngine.setEnabledCipherSuites(cipherSuites.toArray(new String[cipherSuites.size()]));
    }
    return sslEngine;
  }

  /**
   * Returns {@code true} if these {@code TlsOptions} can possibly equal
   * some {@code other} object.
   */
  public boolean canEqual(Object other) {
    return other instanceof TlsOptions;
  }

  @SuppressWarnings("UndefinedEquals")
  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof TlsOptions that) {
      return that.canEqual(this)
          && Objects.equals(this.sslContext, that.sslContext)
          && this.clientAuth.equals(that.clientAuth)
          && Objects.equals(this.protocols, that.protocols)
          && Objects.equals(this.cipherSuites, that.cipherSuites);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(TlsOptions.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        HASH_SEED, Murmur3.hash(this.sslContext)), this.clientAuth.hashCode()),
        Murmur3.hash(this.protocols)), Murmur3.hash(this.cipherSuites)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("TlsOptions", "standard").endInvoke()
            .beginInvoke("sslContext").appendArgument(this.sslContext).endInvoke()
            .beginInvoke("clientAuth").appendArgument(this.clientAuth).endInvoke()
            .beginInvoke("protocols").appendArgument(this.protocols).endInvoke()
            .beginInvoke("cipherSuites").appendArgument(this.cipherSuites).endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  private static @Nullable TlsOptions standard;

  /**
   * Returns the default {@code TlsOptions} instance.
   */
  public static @Nullable TlsOptions standard() {
    if (TlsOptions.standard == null) {
      TlsClientAuth clientAuth;
      try {
        clientAuth = TlsClientAuth.parse(System.getProperty("swim.net.tls.client.auth"));
      } catch (IllegalArgumentException cause) {
        clientAuth = TlsClientAuth.NONE;
      }
      Collection<String> protocols;
      try {
        protocols = Collections.unmodifiableCollection(Arrays.asList(System.getProperty("swim.net.tls.protocols").split(",")));
      } catch (NullPointerException cause) {
        protocols = null;
      }
      Collection<String> cipherSuites;
      try {
        cipherSuites = Collections.unmodifiableCollection(Arrays.asList(System.getProperty("swim.net.tls.ciphersuites").split(",")));
      } catch (NullPointerException cause) {
        cipherSuites = null;
      }
      try {
        TlsOptions.standard = TlsOptions.of(clientAuth, protocols, cipherSuites);
      } catch (IOException | GeneralSecurityException cause) {
        throw new RuntimeException("unable to initialize standard TLS options", cause);
      }
    }
    return TlsOptions.standard;
  }

  public static @Nullable TlsOptions of(TlsClientAuth clientAuth,
                                        @Nullable Collection<String> protocols,
                                        @Nullable Collection<String> cipherSuites)
      throws IOException, GeneralSecurityException {
    final String tlsProtocol = System.getProperty("swim.net.tls.protocol", "TLS");
    final String tlsProvider = System.getProperty("swim.net.tls.provider");
    final String tlsRandom = System.getProperty("swim.net.tls.random");
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
    final KeyManager[] keyManagers = TlsOptions.loadKeyManagers();
    final TrustManager[] trustManagers = TlsOptions.loadTrustManagers();
    sslContext.init(keyManagers, trustManagers, random);
    return new TlsOptions(sslContext, clientAuth, protocols, cipherSuites);
  }

  static KeyManager @Nullable [] loadKeyManagers() throws IOException, GeneralSecurityException {
    final String path = System.getProperty("swim.net.tls.keystore.path");
    final String resource = System.getProperty("swim.net.tls.keystore.resource");
    if (path == null && resource == null) {
      return null;
    }

    final String type = System.getProperty("swim.net.tls.keystore.type", KeyStore.getDefaultType());
    final String provider = System.getProperty("swim.net.tls.keystore.provider");
    final String password = System.getProperty("swim.net.tls.keystore.password");
    final char[] passwordChars = password != null ? password.toCharArray() : null;
    final KeyStore keyStore;
    final KeyManagerFactory keyManagerFactory;
    if (provider != null) {
      keyStore = KeyStore.getInstance(type, provider);
      keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm(), provider);
    } else {
      keyStore = KeyStore.getInstance(type);
      keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
    }

    InputStream inputStream = null;
    try {
      if (path != null) {
        inputStream = new FileInputStream(path);
      } else if (resource != null) {
        inputStream = ClassLoader.getSystemResourceAsStream(resource);
        if (inputStream == null) {
          throw new MissingResourceException("missing swim.net.tls.keystore.resource: " + resource, null, resource);
        }
      }
      keyStore.load(inputStream, passwordChars);
    } finally {
      if (inputStream != null) {
        inputStream.close();
      }
    }
    keyManagerFactory.init(keyStore, passwordChars);
    return keyManagerFactory.getKeyManagers();
  }

  static TrustManager @Nullable [] loadTrustManagers() throws IOException, GeneralSecurityException {
    final String path = System.getProperty("swim.net.tls.truststore.path");
    final String resource = System.getProperty("swim.net.tls.truststore.resource");
    if (path == null && resource == null) {
      return null;
    }

    final String type = System.getProperty("swim.net.tls.truststore.type", KeyStore.getDefaultType());
    final String provider = System.getProperty("swim.net.tls.truststore.provider");
    final String password = System.getProperty("swim.net.tls.truststore.password");
    final char[] passwordChars = password != null ? password.toCharArray() : null;
    final KeyStore trustStore;
    final TrustManagerFactory trustManagerFactory;
    if (provider != null) {
      trustStore = KeyStore.getInstance(type, provider);
      trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm(), provider);
    } else {
      trustStore = KeyStore.getInstance(type);
      trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
    }

    InputStream inputStream = null;
    try {
      if (path != null) {
        inputStream = new FileInputStream(path);
      } else if (resource != null) {
        inputStream = ClassLoader.getSystemResourceAsStream(resource);
        if (inputStream == null) {
          throw new MissingResourceException("missing swim.net.tls.truststore.resource: " + resource, null, resource);
        }
      }
      trustStore.load(inputStream, passwordChars);
    } finally {
      if (inputStream != null) {
        inputStream.close();
      }
    }
    trustManagerFactory.init(trustStore);
    return trustManagerFactory.getTrustManagers();
  }

}
