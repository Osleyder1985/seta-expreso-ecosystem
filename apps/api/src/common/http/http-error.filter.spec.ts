import { ArgumentsHost } from '@nestjs/common';
import { jest } from '@jest/globals';
import { HttpErrorFilter } from './http-error.filter';

describe('HttpErrorFilter', () => {
  it('does not expose stack details for unknown errors', () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ url: '/api/test' }),
      }),
    } as unknown as ArgumentsHost;

    new HttpErrorFilter().catch(new Error('secret internal detail'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Internal server error',
        path: '/api/test',
      }),
    );
    expect(json.mock.calls[0][0]).not.toHaveProperty('stack');
  });
});
