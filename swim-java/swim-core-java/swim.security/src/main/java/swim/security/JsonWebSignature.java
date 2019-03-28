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

package swim.security;

import java.math.BigInteger;
import java.security.GeneralSecurityException;
import java.security.Key;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.interfaces.ECKey;
import java.security.interfaces.RSAKey;
import javax.crypto.Mac;
import swim.codec.Base64;
import swim.codec.Binary;
import swim.codec.Debug;
import swim.codec.Decoder;
import swim.codec.Diagnostic;
import swim.codec.Format;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.codec.Utf8;
import swim.codec.Writer;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieSet;
import swim.json.Json;
import swim.structure.Data;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

public class JsonWebSignature implements Debug {
  protected final Value unprotectedHeader;
  protected final Value protectedHeader;
  protected final Data signingInput;
  protected final Data payloadData;
  protected final Data signatureData;

  public JsonWebSignature(Value unprotectedHeader, Value protectedHeader,
                          Data signingInput, Data payloadData, Data signatureData) {
    this.unprotectedHeader = unprotectedHeader.commit();
    this.protectedHeader = protectedHeader.commit();
    this.signingInput = signingInput;
    this.payloadData = payloadData;
    this.signatureData = signatureData;
  }

  public final Value unprotectedHeader() {
    return this.unprotectedHeader;
  }

  public JsonWebSignature unprotectedHeader(Value unprotectedHeader) {
    return new JsonWebSignature(unprotectedHeader, this.protectedHeader, this.signingInput,
                                this.payloadData, this.signatureData);
  }

  public final Value protectedHeader() {
    return this.protectedHeader;
  }

  public final Data signingInput() {
    return this.signingInput;
  }

  public final Data payloadData() {
    return this.payloadData;
  }

  public final <T> T payload(Decoder<T> decoder) {
    decoder = decoder.feed(payloadData.toInputBuffer());
    if (decoder.isDone()) {
      return decoder.bind();
    } else {
      final Throwable trap = decoder.trap();
      if (trap instanceof RuntimeException) {
        throw (RuntimeException) trap;
      } else {
        throw new RuntimeException(trap);
      }
    }
  }

  public final <T> T payload(Form<T> form) {
    return payload(Json.formDecoder(form));
  }

  public final Value payload() {
    return payload(Form.forValue());
  }

  public final Data signatureData() {
    return this.signatureData;
  }

  public Value get(String name) {
    Value value = this.protectedHeader.get(name);
    if (!value.isDefined()) {
      value = this.unprotectedHeader.get(name);
    }
    return value;
  }

  public String algorithm() {
    return get("alg").stringValue(null);
  }

  public String jsonWebKeySetUrl() {
    return get("jku").stringValue(null);
  }

  public JsonWebKey jsonWebKey() {
    return JsonWebKey.from(get("jwk"));
  }

  public String keyId() {
    return get("kid").stringValue(null);
  }

  public String x509Url() {
    return get("x5u").stringValue(null);
  }

  public FingerTrieSeq<String> x509CertificateChain() {
    FingerTrieSeq<String> x509CertificateChain = FingerTrieSeq.empty();
    for (Item member : get("x5c")) {
      final String x509Certificate = member.stringValue(null);
      if (x509Certificate != null) {
        x509CertificateChain = x509CertificateChain.appended(x509Certificate);
      }
    }
    return x509CertificateChain;
  }

  public String x509Sha1Thumbprint() {
    return get("x5t").stringValue(null);
  }

  public String x509Sha256Thumbprint() {
    return get("x5t#S256").stringValue(null);
  }

  public String type() {
    return get("typ").stringValue(null);
  }

  public String contentType() {
    return get("cty").stringValue(null);
  }

  public HashTrieSet<String> critical() {
    HashTrieSet<String> critical = HashTrieSet.empty();
    for (Item member : get("crit")) {
      final String name = member.stringValue(null);
      if (name != null) {
        critical = critical.added(name);
      }
    }
    return critical;
  }

  public boolean verifyMac(Key symmetricKey) {
    final String algorithm = algorithm();
    try {
      if ("HS256".equals(algorithm)) {
        return verifyMac(Mac.getInstance("HmacSHA256"), symmetricKey);
      } else if ("HS384".equals(algorithm)) {
        return verifyMac(Mac.getInstance("HmacSHA384"), symmetricKey);
      } else if ("HS512".equals(algorithm)) {
        return verifyMac(Mac.getInstance("HmacSHA512"), symmetricKey);
      } else {
        return false;
      }
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public boolean verifyMac(Mac mac, Key symmetricKey) {
    try {
      mac.init(symmetricKey);
      mac.update(signingInput.asByteBuffer());
      final Data signatureData = Data.wrap(mac.doFinal());
      return compareSignatureData(signatureData, this.signatureData);
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public boolean verifySignature(PublicKey publicKey) {
    final String algorithm = algorithm();
    try {
      if ("ES256".equals(algorithm)) {
        return verifyECDSASignature(Signature.getInstance("SHA256withECDSA"), publicKey);
      } else if ("ES384".equals(algorithm)) {
        return verifyECDSASignature(Signature.getInstance("SHA384withECDSA"), publicKey);
      } else if ("ES512".equals(algorithm)) {
        return verifyECDSASignature(Signature.getInstance("SHA512withECDSA"), publicKey);
      } else if ("RS256".equals(algorithm)) {
        return verifyRSASignature(Signature.getInstance("SHA256withRSA"), publicKey);
      } else if ("RS384".equals(algorithm)) {
        return verifyRSASignature(Signature.getInstance("SHA384withRSA"), publicKey);
      } else if ("RS512".equals(algorithm)) {
        return verifyRSASignature(Signature.getInstance("SHA512withRSA"), publicKey);
      } else {
        return false;
      }
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public boolean verifyRSASignature(Signature signature, PublicKey publicKey) {
    try {
      signature.initVerify(publicKey);
      signature.update(signingInput.asByteBuffer());
      return signature.verify(signatureData.asByteArray(), 0, signatureData.size());
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public boolean verifyECDSASignature(Signature signature, PublicKey publicKey) {
    final Data signatureData = derEncodeECDSASignature(this.signatureData);
    try {
      signature.initVerify(publicKey);
      signature.update(signingInput.asByteBuffer());
      return signature.verify(signatureData.asByteArray(), 0, signatureData.size());
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public Writer<?, JsonWebSignature> writeJws(Output<?> output) {
    return JsonWebSignatureWriter.write(output, this);
  }

  public String toJws() {
    final Output<String> output = Unicode.stringOutput();
    writeJws(output);
    return output.bind();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof JsonWebSignature) {
      final JsonWebSignature that = (JsonWebSignature) other;
      return this.unprotectedHeader.equals(that.unprotectedHeader)
          && this.protectedHeader.equals(that.protectedHeader)
          && this.signingInput.equals(that.signingInput)
          && this.payloadData.equals(that.payloadData)
          && this.signatureData.equals(that.signatureData);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(JsonWebSignature.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        hashSeed, this.unprotectedHeader.hashCode()), this.protectedHeader.hashCode()),
        this.signingInput.hashCode()), this.payloadData.hashCode()),
        this.signatureData.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output.write("JsonWebSignature").write('.').write("from").write('(')
        .debug(unprotectedHeader).write(", ").debug(protectedHeader).write(", ")
        .debug(signingInput).write(", ").debug(payloadData).write(", ")
        .debug(signatureData).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static JsonWebSignature from(Value unprotectedHeader, Data signingInput, Data protectedHeaderData,
                                       Data payloadData, Data signatureData) {
    final Value protectedHeader = Json.structureParser().parseObject(Utf8.decodedInput(protectedHeaderData.toInputBuffer())).bind();
    return new JsonWebSignature(unprotectedHeader, protectedHeader, signingInput, payloadData, signatureData);
  }

  public static JsonWebSignature from(Data signingInput, Data protectedHeaderData,
                                      Data payloadData, Data signatureData) {
    return from(Value.absent(), signingInput, protectedHeaderData, payloadData, signatureData);
  }

  public static JsonWebSignature from(Value unprotectedHeader, Data protectedHeaderData,
                                      Data payloadData, Data signatureData) {
    final Output<Data> signingInput = Data.output();
    Base64.urlUnpadded().writeByteBuffer(protectedHeaderData.asByteBuffer(), signingInput);
    signingInput.write('.');
    Base64.urlUnpadded().writeByteBuffer(payloadData.asByteBuffer(), signingInput);
    return from(unprotectedHeader, signingInput.bind(), protectedHeaderData, payloadData, signatureData);
  }

  public static JsonWebSignature from(Data protectedHeaderData, Data payloadData, Data signatureData) {
    return from(Value.absent(), protectedHeaderData, payloadData, signatureData);
  }

  public static JsonWebSignature hmacSHA(Mac mac, Key symmetricKey, Value unprotectedHeader,
                                         Value protectedHeader, Data signingInput, Data payloadData) {
    try {
      mac.init(symmetricKey);
      mac.update(signingInput.asByteBuffer());
      final Data signatureData = Data.wrap(mac.doFinal());
      return new JsonWebSignature(unprotectedHeader, protectedHeader, signingInput,
                                  payloadData, signatureData);
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public static JsonWebSignature hmacSHA(Mac mac, Key symmetricKey, Value unprotectedHeader,
                                         Value protectedHeader, Data payloadData) {
    final Data protectedHeaderData = Json.toData(protectedHeader);
    final Output<Data> signingInput = Data.output();
    Base64.urlUnpadded().writeByteBuffer(protectedHeaderData.asByteBuffer(), signingInput);
    signingInput.write('.');
    Base64.urlUnpadded().writeByteBuffer(payloadData.asByteBuffer(), signingInput);
    return hmacSHA(mac, symmetricKey, unprotectedHeader, protectedHeader,
                   signingInput.bind(), payloadData);
  }

  public static JsonWebSignature hmacSHA(Key symmetricKey, Value unprotectedHeader,
                                         Value protectedHeader, Data payloadData) {
    final String algorithm = symmetricKey.getAlgorithm();
    final Mac mac;
    try {
      if ("HmacSHA256".equals(algorithm)) {
        protectedHeader = protectedHeader.updatedSlot("alg", "HS256");
        mac = Mac.getInstance("HmacSHA256");
      } else if ("HmacSHA384".equals(algorithm)) {
        protectedHeader = protectedHeader.updatedSlot("alg", "HS384");
        mac = Mac.getInstance("HmacSHA384");
      } else if ("HmacSHA512".equals(algorithm)) {
        protectedHeader = protectedHeader.updatedSlot("alg", "HS512");
        mac = Mac.getInstance("HmacSHA512");
      } else {
        throw new IllegalArgumentException("unsupported key size");
      }
      return hmacSHA(mac, symmetricKey, unprotectedHeader, protectedHeader, payloadData);
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public static JsonWebSignature mac(Key symmetricKey, Value unprotectedHeader,
                                     Value protectedHeader, Data payloadData) {
    return hmacSHA(symmetricKey, unprotectedHeader, protectedHeader, payloadData);
  }

  public static JsonWebSignature mac(Key symmetricKey, Value protectedHeader, Data payloadData) {
    return mac(symmetricKey, Value.absent(), protectedHeader, payloadData);
  }

  public static JsonWebSignature mac(Key symmetricKey, Data payloadData) {
    return mac(symmetricKey, Value.absent(), Value.absent(), payloadData);
  }

  public static JsonWebSignature signRSA(Signature signature, PrivateKey privateKey, int keyLength,
                                         Value unprotectedHeader, Value protectedHeader,
                                         Data signingInput, Data payloadData) {
    try {
      signature.initSign(privateKey);
      signature.update(signingInput.asByteBuffer());
      final Data signatureData = Data.wrap(signature.sign());
      return new JsonWebSignature(unprotectedHeader, protectedHeader, signingInput,
                                  payloadData, signatureData);
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public static JsonWebSignature signRSA(Signature signature, PrivateKey privateKey, int keyLength,
                                         Value unprotectedHeader, Value protectedHeader, Data payloadData) {
    final Data protectedHeaderData = Json.toData(protectedHeader);
    final Output<Data> signingInput = Data.output();
    Base64.urlUnpadded().writeByteBuffer(protectedHeaderData.asByteBuffer(), signingInput);
    signingInput.write('.');
    Base64.urlUnpadded().writeByteBuffer(payloadData.asByteBuffer(), signingInput);
    return signRSA(signature, privateKey, keyLength, unprotectedHeader, protectedHeader,
                   signingInput.bind(), payloadData);
  }

  public static JsonWebSignature signRSA(PrivateKey privateKey, Value unprotectedHeader,
                                         Value protectedHeader, Data payloadData) {
    final int keyLength = rsaKeyLength(privateKey);
    final Signature signature;
    try {
      if (keyLength == 32) {
        protectedHeader = protectedHeader.updatedSlot("alg", "RS256");
        signature = Signature.getInstance("SHA256withRSA");
      } else if (keyLength == 48) {
        protectedHeader = protectedHeader.updatedSlot("alg", "RS384");
        signature = Signature.getInstance("SHA384withRSA");
      } else if (keyLength == 64) {
        protectedHeader = protectedHeader.updatedSlot("alg", "RS512");
        signature = Signature.getInstance("SHA512withRSA");
      } else {
        throw new IllegalArgumentException("unsupported key size");
      }
      return signRSA(signature, privateKey, keyLength, unprotectedHeader,
                     protectedHeader, payloadData);
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public static JsonWebSignature signECDSA(Signature signature, PrivateKey privateKey, int keyLength,
                                           Value unprotectedHeader, Value protectedHeader,
                                           Data signingInput, Data payloadData) {
    try {
      signature.initSign(privateKey);
      signature.update(signingInput.asByteBuffer());
      Data signatureData = Data.wrap(signature.sign());
      signatureData = derDecodeECDSASignature(signatureData, keyLength);
      return new JsonWebSignature(unprotectedHeader, protectedHeader, signingInput,
                                  payloadData, signatureData);
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public static JsonWebSignature signECDSA(Signature signature, PrivateKey privateKey, int keyLength,
                                           Value unprotectedHeader, Value protectedHeader, Data payloadData) {
    final Data protectedHeaderData = Json.toData(protectedHeader);
    final Output<Data> signingInput = Data.output();
    Base64.urlUnpadded().writeByteBuffer(protectedHeaderData.asByteBuffer(), signingInput);
    signingInput.write('.');
    Base64.urlUnpadded().writeByteBuffer(payloadData.asByteBuffer(), signingInput);
    return signECDSA(signature, privateKey, keyLength, unprotectedHeader, protectedHeader,
                     signingInput.bind(), payloadData);
  }

  public static JsonWebSignature signECDSA(PrivateKey privateKey, Value unprotectedHeader,
                                           Value protectedHeader, Data payloadData) {
    final int keyLength = ecKeyLength(privateKey);
    final Signature signature;
    try {
      if (keyLength == 32) {
        protectedHeader = protectedHeader.updatedSlot("alg", "ES256");
        signature = Signature.getInstance("SHA256withECDSA");
      } else if (keyLength == 48) {
        protectedHeader = protectedHeader.updatedSlot("alg", "ES384");
        signature = Signature.getInstance("SHA384withECDSA");
      } else if (keyLength == 66) {
        protectedHeader = protectedHeader.updatedSlot("alg", "ES512");
        signature = Signature.getInstance("SHA512withECDSA");
      } else {
        throw new IllegalArgumentException("unsupported key size");
      }
      return signECDSA(signature, privateKey, keyLength, unprotectedHeader,
                       protectedHeader, payloadData);
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public static JsonWebSignature sign(PrivateKey privateKey, Value unprotectedHeader,
                                      Value protectedHeader, Data payloadData) {
    if (privateKey instanceof ECKey) {
      return signECDSA(privateKey, unprotectedHeader, protectedHeader, payloadData);
    } else if (privateKey instanceof RSAKey) {
      return signRSA(privateKey, unprotectedHeader, protectedHeader, payloadData);
    } else {
      throw new IllegalArgumentException("unsupported signing key type");
    }
  }

  public static JsonWebSignature sign(PrivateKey privateKey, Value protectedHeader, Data payloadData) {
    return sign(privateKey, Value.absent(), protectedHeader, payloadData);
  }

  public static JsonWebSignature sign(PrivateKey privateKey, Data payloadData) {
    return sign(privateKey, Value.absent(), Value.absent(), payloadData);
  }

  public static Parser<JsonWebSignature> parser() {
    return new JsonWebSignatureParser();
  }

  public static JsonWebSignature parse(String jws) {
    final Input input = Unicode.stringInput(jws);
    Parser<JsonWebSignature> parser = JsonWebSignatureParser.parse(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }

  static boolean compareSignatureData(Data actual, Data expected) {
    // MUST take constant time regardless of match success
    boolean matches = true;
    for (int i = 0, n = Math.min(actual.size(), expected.size()); i < n; i += 1) {
      matches = actual.getByte(i) == expected.getByte(i) && matches;
    }
    return matches;
  }

  static int ecKeyLength(Key key) {
    final int bitLength = ((ECKey) key).getParams().getOrder().bitLength();
    if (bitLength <= 256) {
      return 32;
    } else if (bitLength <= 384) {
      return 48;
    } else if (bitLength <= 521) {
      return 66;
    } else {
      throw new IllegalArgumentException("unsupported key size");
    }
  }

  static int rsaKeyLength(Key key) {
    final int bitLength = ((RSAKey) key).getModulus().bitLength();
    if (bitLength <= 2048) {
      return 32;
    } else if (bitLength <= 3072) {
      return 48;
    } else if (bitLength <= 4096) {
      return 64;
    } else {
      throw new IllegalArgumentException("unsupported key size");
    }
  }

  static Data derDecodeECDSASignature(Data derData, int n) {
    final Value sequence = Der.structureDecoder().decodeValue(derData.toInputBuffer()).bind();
    final byte[] r = ((Num) sequence.getItem(0)).integerValue().toByteArray();
    final byte[] s = ((Num) sequence.getItem(1)).integerValue().toByteArray();
    final byte[] signatureBytes = new byte[n << 1];
    if (r.length <= n) {
      System.arraycopy(r, 0, signatureBytes, n - r.length, r.length);
    } else {
      System.arraycopy(r, r.length - n, signatureBytes, 0, n);
    }
    if (s.length <= n) {
      System.arraycopy(s, 0, signatureBytes, n + (n - s.length), s.length);
    } else {
      System.arraycopy(s, s.length - n, signatureBytes, n, n);
    }
    return Data.wrap(signatureBytes);
  }

  static Data derEncodeECDSASignature(Data signatureData) {
    final int n = signatureData.size() >>> 1;
    final byte[] signature = signatureData.asByteArray();
    final byte[] magnitude = new byte[n];
    System.arraycopy(signature, 0, magnitude, 0, n);
    final Num r = Num.from(new BigInteger(1, magnitude));
    System.arraycopy(signature, n, magnitude, 0, n);
    final Num s = Num.from(new BigInteger(1, magnitude));

    final Value sequence = Record.of(r, s);
    final byte[] derBytes = new byte[Der.structureEncoder().sizeOf(sequence)];
    Der.structureEncoder().encode(sequence, Binary.outputBuffer(derBytes));
    return Data.wrap(derBytes);
  }
}
