package swim.config.annotation.validator;

import com.github.javaparser.ast.expr.BinaryExpr;
import com.github.javaparser.ast.expr.FieldAccessExpr;
import com.github.javaparser.ast.expr.MethodCallExpr;
import com.github.javaparser.ast.expr.NameExpr;
import com.github.javaparser.ast.expr.NullLiteralExpr;
import com.github.javaparser.ast.expr.ObjectCreationExpr;
import com.github.javaparser.ast.expr.StringLiteralExpr;
import com.github.javaparser.ast.stmt.BlockStmt;
import com.github.javaparser.ast.stmt.IfStmt;

import java.lang.annotation.Annotation;

public abstract class AbstractValidationGenerator<T extends Annotation> {
  protected Class<T> attributeClass;

  public AbstractValidationGenerator(Class<T> attributeClass) {
    this.attributeClass = attributeClass;
  }

  protected String processDoc(Annotation annotation) {
    return doc((T) annotation);
  }
  protected abstract String doc(T attribute);

  protected void processValidation(BlockStmt validateBody, FieldAccessExpr fieldAccessExpr, StringLiteralExpr methodNameLiteral, Annotation annotation) {
    addValidation(validateBody, fieldAccessExpr, methodNameLiteral, (T) annotation);
  }

  protected abstract void addValidation(BlockStmt validateBody, FieldAccessExpr fieldAccessExpr, StringLiteralExpr methodNameLiteral, T annotation);

  protected MethodCallExpr addError(StringLiteralExpr methodNameLiteral, FieldAccessExpr fieldAccessExpr, String format, Object... args) {
    return new MethodCallExpr()
        .setScope(new NameExpr("errors"))
        .setName("add")
        .addArgument(
            new ObjectCreationExpr()
                .setType("ConfigError")
                .addArgument(methodNameLiteral)
                .addArgument(fieldAccessExpr)
                .addArgument(new StringLiteralExpr(String.format(format, args)))
        );
  }

  protected IfStmt errorIfNull(BlockStmt parentBody, FieldAccessExpr fieldAccessExpr, StringLiteralExpr methodNameLiteral) {
    IfStmt ifNull = new IfStmt()
        .setCondition(
            new BinaryExpr(
                fieldAccessExpr,
                new NullLiteralExpr(),
                BinaryExpr.Operator.EQUALS
            )
        )
        .setThenStmt(
            new BlockStmt().addStatement(
                addError(methodNameLiteral, fieldAccessExpr, "value cannot be null.")
            )
        );
    parentBody.addStatement(ifNull);
    return ifNull;
  }
}
