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

package swim.security;

import java.math.BigInteger;
import java.security.GeneralSecurityException;
import java.security.Key;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.interfaces.ECKey;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.interfaces.RSAKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.ECParameterSpec;
import java.security.spec.ECPoint;
import java.security.spec.ECPrivateKeySpec;
import java.security.spec.ECPublicKeySpec;
import java.security.spec.KeySpec;
import java.security.spec.RSAMultiPrimePrivateCrtKeySpec;
import java.security.spec.RSAOtherPrimeInfo;
import java.security.spec.RSAPrivateCrtKeySpec;
import java.security.spec.RSAPrivateKeySpec;
import java.security.spec.RSAPublicKeySpec;
import javax.crypto.spec.SecretKeySpec;
import swim.codec.Base64;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.Unicode;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieSet;
import swim.json.Json;
import swim.structure.Item;
import swim.structure.Value;
import swim.util.Murmur3;

public class JsonWebKey implements Debug {

  protected final Value value;

  public JsonWebKey(Value value) {
    this.value = value.commit();
  }

  public Value get(String name) {
    return this.value.get(name);
  }

  public String keyType() {
    return this.value.get("kty").stringValue(null);
  }

  public String publicKeyUse() {
    return this.value.get("use").stringValue(null);
  }

  public HashTrieSet<String> keyOperations() {
    HashTrieSet<String> keyOperations = HashTrieSet.empty();
    for (Item member : this.value.get("key_ops")) {
      final String keyOperation = member.stringValue(null);
      if (keyOperation != null) {
        keyOperations = keyOperations.added(keyOperation);
      }
    }
    return keyOperations;
  }

  public String algorithm() {
    return this.value.get("alg").stringValue(null);
  }

  public String keyId() {
    return this.value.get("kid").stringValue(null);
  }

  public String x509Url() {
    return this.value.get("x5u").stringValue(null);
  }

  public FingerTrieSeq<String> x509CertificateChain() {
    FingerTrieSeq<String> x509CertificateChain = FingerTrieSeq.empty();
    for (Item member : this.value.get("x5c")) {
      final String x509Certificate = member.stringValue(null);
      if (x509Certificate != null) {
        x509CertificateChain = x509CertificateChain.appended(x509Certificate);
      }
    }
    return x509CertificateChain;
  }

  public String x509Sha1Thumbprint() {
    return this.value.get("x5t").stringValue(null);
  }

  public String x509Sha256Thumbprint() {
    return this.value.get("x5t#S256").stringValue(null);
  }

  public Key key() {
    final String keyType = this.keyType();
    if ("EC".equals(keyType)) {
      return (Key) this.ecKey();
    } else if ("RSA".equals(keyType)) {
      return (Key) this.rsaKey();
    } else if ("oct".equals(keyType)) {
      return this.symmetricKey();
    }
    return null;
  }

  public KeyDef keyDef() {
    final Key key = this.key();
    if (key != null) {
      return KeyDef.from(key);
    }
    return null;
  }

  public PublicKey publicKey() {
    final String keyType = this.keyType();
    if ("EC".equals(keyType)) {
      return (PublicKey) this.ecPublicKey();
    } else if ("RSA".equals(keyType)) {
      return (PublicKey) this.rsaPublicKey();
    } else {
      return null;
    }
  }

  public PublicKeyDef publicKeyDef() {
    final PublicKey publicKey = this.publicKey();
    if (publicKey != null) {
      return PublicKeyDef.from(publicKey);
    }
    return null;
  }

  public PrivateKey privateKey() {
    final String keyType = this.keyType();
    if ("EC".equals(keyType)) {
      return (PrivateKey) this.ecPrivateKey();
    } else if ("RSA".equals(keyType)) {
      return (PrivateKey) this.rsaPrivateKey();
    } else {
      return null;
    }
  }

  public PrivateKeyDef privateKeyDef() {
    final PrivateKey privateKey = this.privateKey();
    if (privateKey != null) {
      return PrivateKeyDef.from(privateKey);
    }
    return null;
  }

  public ECKey ecKey() {
    if (this.value.containsKey("d")) {
      return this.ecPrivateKey();
    } else {
      return this.ecPublicKey();
    }
  }

  public ECPublicKey ecPublicKey() {
    final ECParameterSpec params = JsonWebKey.ecParameterSpec(this.value.get("crv").stringValue());
    final BigInteger x = JsonWebKey.parseBase64UrlUInt(this.value.get("x").stringValue());
    final BigInteger y = JsonWebKey.parseBase64UrlUInt(this.value.get("y").stringValue());
    try {
      final ECPublicKeySpec keySpec = new ECPublicKeySpec(new ECPoint(x, y), params);
      final KeyFactory keyFactory = KeyFactory.getInstance("EC");
      return (ECPublicKey) keyFactory.generatePublic(keySpec);
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public ECPrivateKey ecPrivateKey() {
    final ECParameterSpec params = JsonWebKey.ecParameterSpec(this.value.get("crv").stringValue());
    final BigInteger d = JsonWebKey.parseBase64UrlUInt(this.value.get("d").stringValue());
    try {
      final ECPrivateKeySpec keySpec = new ECPrivateKeySpec(d, params);
      final KeyFactory keyFactory = KeyFactory.getInstance("EC");
      return (ECPrivateKey) keyFactory.generatePrivate(keySpec);
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public RSAKey rsaKey() {
    if (this.value.containsKey("d")) {
      return this.rsaPrivateKey();
    } else {
      return this.rsaPublicKey();
    }
  }

  public RSAPublicKey rsaPublicKey() {
    final BigInteger modulus = JsonWebKey.parseBase64UrlUInt(this.value.get("n").stringValue());
    final BigInteger publicExponent = JsonWebKey.parseBase64UrlUInt(this.value.get("e").stringValue());
    try {
      final RSAPublicKeySpec keySpec = new RSAPublicKeySpec(modulus, publicExponent);
      final KeyFactory keyFactory = KeyFactory.getInstance("RSA");
      return (RSAPublicKey) keyFactory.generatePublic(keySpec);
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public RSAPrivateKey rsaPrivateKey() {
    final BigInteger modulus = JsonWebKey.parseBase64UrlUInt(this.value.get("n").stringValue());
    final BigInteger privateExponent = JsonWebKey.parseBase64UrlUInt(this.value.get("d").stringValue());
    try {
      final KeyFactory keyFactory = KeyFactory.getInstance("RSA");
      final KeySpec keySpec;
      final Value p = this.value.get("p");
      if (!p.isDefined()) {
        keySpec = new RSAPrivateKeySpec(modulus, privateExponent);
      } else {
        final BigInteger publicExponent = JsonWebKey.parseBase64UrlUInt(this.value.get("e").stringValue());
        final BigInteger primeP = JsonWebKey.parseBase64UrlUInt(p.stringValue());
        final BigInteger primeQ = JsonWebKey.parseBase64UrlUInt(this.value.get("q").stringValue());
        final BigInteger primeExponentP = JsonWebKey.parseBase64UrlUInt(this.value.get("dp").stringValue());
        final BigInteger primeExponentQ = JsonWebKey.parseBase64UrlUInt(this.value.get("dq").stringValue());
        final BigInteger crtCoefficient = JsonWebKey.parseBase64UrlUInt(this.value.get("qi").stringValue());
        final Value oth = this.value.get("oth");
        if (!oth.isDefined()) {
          keySpec = new RSAPrivateCrtKeySpec(modulus, publicExponent, privateExponent, primeP, primeQ,
                                             primeExponentP, primeExponentQ, crtCoefficient);
        } else {
          final RSAOtherPrimeInfo[] otherPrimeInfo = new RSAOtherPrimeInfo[oth.length()];
          for (int i = 0; i < otherPrimeInfo.length; i += 1) {
            final Item item = oth.getItem(i);
            final BigInteger prime = JsonWebKey.parseBase64UrlUInt(oth.get("r").stringValue());
            final BigInteger primeExponent = JsonWebKey.parseBase64UrlUInt(oth.get("d").stringValue());
            final BigInteger coefficient = JsonWebKey.parseBase64UrlUInt(oth.get("t").stringValue());
            otherPrimeInfo[i] = new RSAOtherPrimeInfo(prime, primeExponent, coefficient);
          }
          keySpec = new RSAMultiPrimePrivateCrtKeySpec(modulus, publicExponent, privateExponent,
                                                       primeP, primeQ, primeExponentP, primeExponentQ,
                                                       crtCoefficient, otherPrimeInfo);
        }
      }
      return (RSAPrivateKey) keyFactory.generatePrivate(keySpec);
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public Key symmetricKey(String algorithm) {
    return new SecretKeySpec(JsonWebKey.parseBase64Url(this.value.get("k").stringValue()), algorithm);
  }

  public Key symmetricKey() {
    final String algorithm = this.algorithm();
    if ("HS256".equals(algorithm)) {
      return this.symmetricKey("HmacSHA256");
    } else if ("HS384".equals(algorithm)) {
      return this.symmetricKey("HmacSHA384");
    } else if ("HS512".equals(algorithm)) {
      return this.symmetricKey("HmacSHA512");
    } else {
      return this.symmetricKey("");
    }
  }

  public final Value toValue() {
    return this.value;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof JsonWebKey) {
      final JsonWebKey that = (JsonWebKey) other;
      return this.value.equals(that.value);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (JsonWebKey.hashSeed == 0) {
      JsonWebKey.hashSeed = Murmur3.seed(JsonWebKey.class);
    }
    return Murmur3.mash(Murmur3.mix(JsonWebKey.hashSeed, this.value.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("JsonWebKey").write('.').write("from").write('(')
                   .debug(this.value).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static JsonWebKey from(Value value) {
    // TODO: validate
    return new JsonWebKey(value);
  }

  public static JsonWebKey parse(String jwk) {
    return JsonWebKey.from(Json.parse(jwk));
  }

  private static byte[] parseBase64Url(String value) {
    return Base64.urlUnpadded().parseByteArray(Unicode.stringInput(value)).bind();
  }

  private static BigInteger parseBase64UrlUInt(String value) {
    return new BigInteger(1, JsonWebKey.parseBase64Url(value));
  }

  static ECParameterSpec p256;
  static ECParameterSpec p384;
  static ECParameterSpec p521;

  private static ECParameterSpec ecParameterSpec(String crv) {
    if ("P-256".equals(crv)) {
      if (JsonWebKey.p256 == null) {
        JsonWebKey.p256 = createECParameterSpec("secp256r1");
      }
      return JsonWebKey.p256;
    } else if ("P-384".equals(crv)) {
      if (JsonWebKey.p384 == null) {
        JsonWebKey.p384 = createECParameterSpec("secp384r1");
      }
      return JsonWebKey.p384;
    } else if ("P-521".equals(crv)) {
      if (JsonWebKey.p521 == null) {
        JsonWebKey.p521 = createECParameterSpec("secp521r1");
      }
      return JsonWebKey.p521;
    } else {
      return null;
    }
  }

  private static ECParameterSpec createECParameterSpec(String stdName) {
    try {
      final KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("EC");
      final ECGenParameterSpec parameterSpec = new ECGenParameterSpec(stdName);
      keyPairGenerator.initialize(parameterSpec);
      final KeyPair keyPair = keyPairGenerator.generateKeyPair();
      final ECPublicKey publicKey = (ECPublicKey) keyPair.getPublic();
      return publicKey.getParams();
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

}
