package swim.config.validator;


import org.testng.IDataProviderInterceptor;
import org.testng.IDataProviderMethod;
import org.testng.ITestContext;
import org.testng.ITestNGMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Listeners;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.Iterator;
import java.util.Optional;
import java.util.stream.Stream;

@Listeners({AbstractValidatorSpecImplementation.AttributeDataProviderInterceptor.class})
public abstract class AbstractValidatorSpecImplementation<T extends Annotation, V, X extends AbstractValidator<T, V>> {
  protected final Class<T> validatorAttributeClass;

  protected X validator;

  //TODO: Change this to load via the Validator Attribute.
  protected abstract X createValidator();

  @BeforeMethod
  public void beforeEach() {
    this.validator = createValidator();
  }

  protected AbstractValidatorSpecImplementation(Class<T> validatorAttributeClass) {
    this.validatorAttributeClass = validatorAttributeClass;
  }

  @DataProvider(name = "attribute")
  public static Object[][] provideAttribute() {
    return new Object[][]{};
  }

  public static class AttributeDataProviderInterceptor implements IDataProviderInterceptor {
    @Override
    public Iterator<Object[]> intercept(Iterator<Object[]> original, IDataProviderMethod dataProviderMethod, ITestNGMethod testNGMethod, ITestContext iTestContext) {
      Method method = testNGMethod.getConstructorOrMethod().getMethod();
      if (1 != method.getParameterCount()) {
        throw new IllegalStateException("Test must have a single parameter");
      }
      Class<?> parameterClass = method.getParameterTypes()[0];
      Optional<Annotation> annotation = Stream.of(method.getDeclaredAnnotations())
          .filter(a -> parameterClass.isAssignableFrom(a.getClass()))
          .findFirst();

      if (annotation.isEmpty()) {
        throw new IllegalStateException(
            String.format(
                "Parameter type of %s was not declared on method. Check attribute is declared and that attribute has RetentionPolicy.RUNTIME.",
                parameterClass.getName()
            )
        );
      }

      return Stream.of(annotation.get())
          .map(o -> new Object[]{o})
          .iterator();
    }
  }
}
