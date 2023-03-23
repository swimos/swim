package swim.config.annotation.validator;

import com.github.javaparser.ast.expr.BinaryExpr;
import com.github.javaparser.ast.expr.FieldAccessExpr;
import com.github.javaparser.ast.expr.NullLiteralExpr;
import com.github.javaparser.ast.expr.StringLiteralExpr;
import com.github.javaparser.ast.stmt.BlockStmt;
import com.github.javaparser.ast.stmt.IfStmt;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;


@Target(ElementType.METHOD)
@Retention(RetentionPolicy.SOURCE)
public @interface Required {
  class Generator extends AbstractValidationGenerator<Required> {

    public Generator() {
      super(Required.class);
    }

    @Override
    protected String doc(Required attribute) {
      return "Required.";
    }

    @Override
    protected void addValidation(BlockStmt validateBody, FieldAccessExpr fieldAccessExpr, StringLiteralExpr methodNameLiteral, Required annotation) {
      IfStmt ifLessThan = new IfStmt()
          .setCondition(
              new BinaryExpr(
                  fieldAccessExpr,
                  new NullLiteralExpr(),
                  BinaryExpr.Operator.EQUALS
              )
          ).setThenStmt(
              new BlockStmt().addStatement(
                  addError(methodNameLiteral, fieldAccessExpr, "value cannot be null.")
              )
          );
      validateBody.addStatement(ifLessThan);
    }
  }
}
