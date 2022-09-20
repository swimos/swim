import java.io.IOException;
import java.io.InputStream;
import swim.codec.Utf8;
import swim.recon.Recon;
import swim.structure.Item;

final class TestUtils {

  private TestUtils() {
  }

  public static Item readReconAuthSpec(String authSpecFile) throws IOException {
    final InputStream configInput = TestUtils.class.getResourceAsStream(authSpecFile);
    return Utf8.read(configInput, Recon.structureParser().blockParser()).head();
  }

}
