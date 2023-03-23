package swim.config.annotation.validator;

import com.github.javaparser.ast.expr.BinaryExpr;
import com.github.javaparser.ast.expr.FieldAccessExpr;
import com.github.javaparser.ast.expr.IntegerLiteralExpr;
import com.github.javaparser.ast.expr.StringLiteralExpr;
import com.github.javaparser.ast.stmt.BlockStmt;
import com.github.javaparser.ast.stmt.IfStmt;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;


@Target(ElementType.METHOD)
@Retention(RetentionPolicy.SOURCE)
public @interface ValidPort {
  int min() default 1024;

  int max() default 65535;

  class Generator extends AbstractValidationGenerator<ValidPort> {

    public Generator() {
      super(ValidPort.class);
    }


    @Override
    protected String doc(ValidPort attribute) {
      return String.format("Must be between %s and %s.", attribute.min(), attribute.max());
    }

    @Override
    protected void addValidation(BlockStmt validateBody, FieldAccessExpr fieldAccessExpr, StringLiteralExpr methodNameLiteral, ValidPort annotation) {
      BinaryExpr min = new BinaryExpr(
          fieldAccessExpr,
          new IntegerLiteralExpr(Integer.toString(annotation.min())),
          BinaryExpr.Operator.LESS
      );

      BinaryExpr max = new BinaryExpr(
          fieldAccessExpr,
          new IntegerLiteralExpr(Integer.toString(annotation.max())),
          BinaryExpr.Operator.GREATER
      );

      BinaryExpr or = new BinaryExpr(
          min,
          max,
          BinaryExpr.Operator.OR
      );

      IfStmt ifOr = new IfStmt()
          .setCondition(or)
          .setThenStmt(
              new BlockStmt().addStatement(
                  addError(methodNameLiteral, fieldAccessExpr, "value must be between %s and %s.", annotation.min(), annotation.max())
              )
          );

      validateBody.addStatement(ifOr);
    }
  }
}
