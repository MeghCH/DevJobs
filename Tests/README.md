# End-to-End (E2E) Testing

This directory contains end-to-end tests for the Job Aggregator Platform using Playwright.

## Setup

### Prerequisites
- Node.js (v14 or later)
- npm or yarn

### Install Playwright

Run the following command to install Playwright:

```bash
npm install @playwright/test
```

### Install Browsers

Playwright requires browsers to run the tests. Install them using:

```bash
npx playwright install
```

## Running Tests

### Run All Tests

To run all the tests, use the following command:

```bash
npx playwright test
```

### Run Specific Tests

To run a specific test file, use:

```bash
npx playwright test tests/e2e.spec.js
```

### Run Tests in Headed Mode

To see the tests running in a browser window, use:

```bash
npx playwright test --headed
```

### Run Tests in Debug Mode

To debug tests, use:

```bash
npx playwright test --debug
```

## Test Reports

### Generate HTML Report

After running the tests, generate an HTML report using:

```bash
npx playwright show-report
```

This will open a browser window with the test report.

### Generate JSON Report

To generate a JSON report, use:

```bash
npx playwright test --reporter=json
```

## Writing Tests

### Test Structure

Tests are written using the Playwright test runner. Each test file should follow the structure below:

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Test Suite Name', () => {
  test('Test Name', async ({ page }) => {
    // Test code here
  });
});
```

### Best Practices

- **Descriptive Test Names**: Use clear and descriptive names for your tests.
- **Isolate Tests**: Each test should be independent and not rely on the state of other tests.
- **Use Assertions**: Use Playwright's built-in assertions to verify the expected behavior.
- **Handle Async Operations**: Use `await` to handle asynchronous operations.

## Continuous Integration

To integrate E2E tests into your CI/CD pipeline, add the following step to your workflow:

```yaml
- name: Run E2E Tests
  run: npx playwright test
```

## Troubleshooting

### Common Issues

- **Browser Not Installed**: Ensure you have run `npx playwright install` to install the required browsers.
- **Port Conflicts**: Make sure the application is running on the correct port and there are no port conflicts.
- **Element Not Found**: Use Playwright's debugging tools to inspect the page and verify the selectors.

### Debugging Tips

- Use `console.log` to print debug information.
- Use `page.pause()` to pause the test and inspect the page.
- Use `playwright.codegen` to generate test code by recording your actions.

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Playwright GitHub Repository](https://github.com/microsoft/playwright)