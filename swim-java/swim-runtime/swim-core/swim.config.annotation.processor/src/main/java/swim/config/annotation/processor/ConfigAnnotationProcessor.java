package swim.config.annotation.processor;

import swim.config.model.ConfigurationElement;
import swim.config.model.Manifest;
import swim.json.Json;
import swim.structure.Form;
import swim.structure.Item;

import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedAnnotationTypes;
import javax.annotation.processing.SupportedSourceVersion;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.Diagnostic;
import javax.tools.FileObject;
import javax.tools.StandardLocation;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@SupportedAnnotationTypes({"swim.config.Config", "swim.config.Adapter"}) //
@SupportedSourceVersion(SourceVersion.RELEASE_11)
public class ConfigAnnotationProcessor extends AbstractProcessor {

  long count=0;
  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    count++;

    Optional<? extends TypeElement> adapterElement = annotations.stream()
        .filter(a -> a.getQualifiedName()
            .contentEquals("swim.config.Adapter"))
        .findFirst();

    Optional<? extends TypeElement> configElement = annotations.stream()
        .filter(a -> a.getQualifiedName()
            .contentEquals("swim.config.Config"))
        .findFirst();

    if(adapterElement.isEmpty() || configElement.isEmpty()) {
      return true;
    }

    Map<TypeElement, ConfigurationElement> configurations = new HashMap<>();

    ConfigScanner scanner = new ConfigScanner(processingEnv, configurations);
    Set<? extends Element> configElements = roundEnv.getElementsAnnotatedWith(configElement.get());
    configElements.forEach(scanner::scan);

    Manifest manifest = new Manifest();
    AdapterScanner adapterScanner = new AdapterScanner(processingEnv, configurations, manifest);
    Set<? extends Element> adapterElements = roundEnv.getElementsAnnotatedWith(adapterElement.get());
    adapterElements.forEach(adapterScanner::scan);

    try {
      FileObject resource = processingEnv.getFiler().createResource(
          StandardLocation.CLASS_OUTPUT,
          "swim",
          "manifest.js"
      );

      Form<Manifest> manifestForm = Form.forClass(Manifest.class);
      Item manifestItem = manifestForm.mold(manifest);

      try (Writer writer = new OutputStreamWriter(resource.openOutputStream())) {
        writer.write(Json.toString(manifestItem));
      }
    } catch (IOException ex) {
      throw new RuntimeException(ex);
    }

    return true;
  }

}
