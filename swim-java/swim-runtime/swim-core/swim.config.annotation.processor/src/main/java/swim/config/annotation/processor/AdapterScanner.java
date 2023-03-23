package swim.config.annotation.processor;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.javadoc.Javadoc;
import com.sun.source.util.DocTrees;
import swim.config.annotation.Adapter;
import swim.config.model.AdapterElement;
import swim.config.model.ConfigurationElement;
import swim.config.model.IconElement;
import swim.config.model.Manifest;

import javax.annotation.processing.ProcessingEnvironment;
import javax.lang.model.element.AnnotationMirror;
import javax.lang.model.element.AnnotationValue;
import javax.lang.model.element.TypeElement;
import javax.lang.model.util.ElementScanner9;
import javax.tools.Diagnostic;
import javax.tools.FileObject;
import javax.tools.StandardLocation;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.NoSuchFileException;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;

public class AdapterScanner extends ElementScanner9<Void, Void> {
  final Map<TypeElement, ConfigurationElement> configurations;
  final Manifest manifest;

  final ProcessingEnvironment processingEnv;
  final DocTrees docTrees;

  public AdapterScanner(ProcessingEnvironment processingEnv, Map<TypeElement, ConfigurationElement> configurations, Manifest manifest) {
    this.configurations = configurations;
    this.manifest = manifest;
    this.processingEnv = processingEnv;
    this.docTrees = DocTrees.instance(this.processingEnv);
  }


  Optional<? extends AnnotationValue> annotationValue(AnnotationMirror annotationMirror, String propertyName) {
    return annotationMirror.getElementValues()
        .entrySet()
        .stream()
        .filter(m -> m.getKey().getSimpleName().contentEquals(propertyName))
        .map(Map.Entry::getValue)
        .findFirst();
  }

  void addIcon(TypeElement e, AnnotationMirror annotationMirror, String icon, Consumer<IconElement> iconConsumer) {
    String propertyIconName = String.format("icon%sName", icon);
    String propertyIconType = String.format("icon%sType", icon);

    Optional<? extends AnnotationValue> annotationIconName = annotationValue(annotationMirror, propertyIconName);
    Optional<? extends AnnotationValue> annotationIconType = annotationValue(annotationMirror, propertyIconType);

    if (annotationIconName.isEmpty()) {
      return;
    }

    String iconName = annotationIconName.get().getValue().toString();
    if (null == iconName || iconName.isEmpty()) {
      return;
    }

    IconElement iconElement = new IconElement();
    annotationIconType.ifPresent(t -> {
      String contentType = t.getValue().toString();
      if (null != contentType && !contentType.isEmpty()) {
        iconElement.contentType(contentType);
      }
    });

    try {
      String packageName = this.processingEnv.getElementUtils().getPackageOf(e).getQualifiedName().toString();
      FileObject fileObject = this.processingEnv.getFiler().getResource(
          StandardLocation.SOURCE_PATH,
          packageName,
          iconName
      );
      URI uri = fileObject.toUri();
      try (InputStream inputStream = fileObject.openInputStream()) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
          inputStream.transferTo(outputStream);
          iconElement.imageBytes(outputStream.toByteArray());
        }
      }
    } catch (NoSuchFileException ex) {
      this.processingEnv.getMessager().printMessage(
          Diagnostic.Kind.ERROR,
          String.format("Icon resource was not found. Path: %s", ex.getFile()),
          e,
          annotationMirror
      );
    } catch (IOException ex) {
      return;
//      throw new RuntimeException(ex);
    }

    iconConsumer.accept(iconElement);
  }

  @Override
  public Void visitType(TypeElement e, Void unused) {
    Optional<? extends AnnotationMirror> optionalAdapterTypeMirror = e.getAnnotationMirrors().stream()
        .filter(a -> a.getAnnotationType().asElement().asType().toString().equals(Adapter.class.getName()))
        .findFirst();

    if (optionalAdapterTypeMirror.isEmpty()) {
      return null;
    }

    AnnotationMirror adapterTypeMirror = optionalAdapterTypeMirror.get();


    Optional<? extends AnnotationValue> annotationConfiguration = annotationValue(adapterTypeMirror, "configuration");
    Optional<? extends AnnotationValue> annotationDisplayName = annotationValue(adapterTypeMirror, "displayName");

    if (annotationConfiguration.isEmpty() || annotationDisplayName.isEmpty()) {
      return null;
    }


    String configClassName = annotationConfiguration.get().getValue().toString();
    String displayName = annotationDisplayName.get().getValue().toString();

    Optional<ConfigurationElement> config = this.configurations.entrySet()
        .stream()
        .filter(t -> t.getKey().getQualifiedName().contentEquals(configClassName))
        .map(Map.Entry::getValue)
        .findFirst();

    if (config.isEmpty()) {
      return null;
    }

    AdapterElement adapterElement = new AdapterElement();
    adapterElement.adapterClass(e.getQualifiedName().toString());
    adapterElement.configuration(config.get());
    adapterElement.displayName(displayName);

    addIcon(e, adapterTypeMirror, "Small", adapterElement::smallIcon);
    addIcon(e, adapterTypeMirror, "Large", adapterElement::largeIcon);
    addIcon(e, adapterTypeMirror, "Gallery", adapterElement::galleryIcon);

    String comments = processingEnv.getElementUtils().getDocComment(e);
    if (null != comments && !comments.isEmpty()) {
      Javadoc javadoc = StaticJavaParser.parseJavadoc(comments);
      adapterElement.documentation(javadoc.getDescription().toText());
    }


    this.manifest.adapters().add(adapterElement);


    return null;
  }
}
