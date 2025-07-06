export function isMaliciousStr(str: string) {
  const maliciousInputs: string[] = [
    // SQL Injection
    "' OR '1'='1",
    "'; DROP TABLE users;--",
    "admin' --",
    "' OR 1=1--",
    "' OR 'a'='a",
    "'; EXEC xp_cmdshell('dir'); --",

    // XSS (Cross-Site Scripting)
    "<script>alert('XSS')</script>",
    '"><script>alert(1)</script>',
    "<img src=x onerror=alert('XSS')>",
    "<svg/onload=alert('XSS')>",
    "<iframe src='javascript:alert(`XSS`)'></iframe>",

    // Command Injection
    "test; ls -la",
    "admin && rm -rf /",
    "`cat /etc/passwd`",
    "|| shutdown -h now",
    "$(reboot)",

    // Path Traversal
    "../../etc/passwd",
    "..\\..\\windows\\system32\\cmd.exe",
    "/../../../../var/log/auth.log",
    "%2e%2e%2fetc%2fpasswd", // URL encoded

    // LDAP Injection
    "*)(uid=*))(|(uid=*",
    "*)(&(objectclass=*))",
    "admin)(|(password=*))",

    // XML External Entity (XXE)
    `<?xml version="1.0"?>
  <!DOCTYPE root [
    <!ENTITY xxe SYSTEM "file:///etc/passwd">
  ]>
  <root>&xxe;</root>`,

    // Shell Metacharacters
    "; echo hello",
    "| whoami",
    "& id",
    "`ls`",

    // Unicode / Confusables (obfuscation)
    "％27--",
    "＇; DROP TABLE users;--",
    "ᴀᴅᴍɪɴ' --",
  ];
  return maliciousInputs.some((maliciousStr) => maliciousStr === str);
};

export function isEmptyString(str: string) {
  return str.trim() === ""; 
};


