package swim.config.annotation.validator;

import com.github.javaparser.ast.expr.FieldAccessExpr;
import com.github.javaparser.ast.expr.StringLiteralExpr;
import com.github.javaparser.ast.stmt.BlockStmt;

import javax.lang.model.element.ExecutableElement;
import java.lang.annotation.Annotation;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Validators {
  private static final Map<Class<? extends java.lang.annotation.Annotation>, AbstractValidationGenerator<?>> VALIDATION_GENERATORS;

  static {
    VALIDATION_GENERATORS =
        Stream.of(
                new Required.Generator(),
                new ValidPort.Generator(),
                new Contains.Generator(),
                new ContainsKey.Generator()
            )
            .collect(Collectors.toMap(e -> e.attributeClass, e -> e));
  }

  public static void addValidation(BlockStmt validateBody, ExecutableElement e, StringLiteralExpr methodNameLiteral, FieldAccessExpr fieldAccessExpr) {
    for (Map.Entry<Class<? extends Annotation>, AbstractValidationGenerator<?>> entry : VALIDATION_GENERATORS.entrySet()) {
      Annotation annotation = e.getAnnotation(entry.getKey());
      AbstractValidationGenerator<?> validationGenerator = entry.getValue();

      if (null != annotation) {
        validationGenerator.processValidation(validateBody, fieldAccessExpr, methodNameLiteral, annotation);
      }
    }
  }

  public static List<String> addDocs(ExecutableElement e) {
    List<String> result = new ArrayList<>();

    for (Map.Entry<Class<? extends Annotation>, AbstractValidationGenerator<?>> entry : VALIDATION_GENERATORS.entrySet()) {
      Annotation annotation = e.getAnnotation(entry.getKey());
      AbstractValidationGenerator<?> validationGenerator = entry.getValue();

      if (null != annotation) {
        String doc = validationGenerator.processDoc(annotation);
        if (null != doc && !doc.isEmpty()) {
          result.add(doc);
        }
      }
    }

    return result;
  }

}
