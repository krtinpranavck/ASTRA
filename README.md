# ASTRA
AST-Based Accessibility Review Tool

VISION DOCUMENT

**1. Overview**

ASTRA is an automated static code analysis tool that detects and reports web accessibility (WCAG 2.2) compliance issues in React/JSX source code during development. Using AST-level inspection and rule-based analysis, the tool evaluates React/JSX components against predefined accessibility rules, identifies common violations, classifies them by severity, and generates structured reports with developer-friendly explanations and remediation guidance. It operates autonomously by accepting React/JSX source code, executing accessibility checks, and producing actionable reports without requiring manual intervention.

**Proposed Workflow**


Developer -> Upload React/JSX File -> AST Parser -> Rule-Based Accessibility Engine -> Severity Classification -> Accessibility Report -> Developer Recommendations

**2: Problem It Solves**


Many websites fail basic accessibility requirements, making them harder to use for people with disabilities. Even when a website looks modern and works for sighted users, it may still lack important accessibility features such as labels, alt text, semantic structure, and keyboard-friendly navigation. This project helps detect those issues early and gives developers a clear way to improve accessibility.

**3. Target Users**

**Persona 1: Frontend / Student Developer**

Goal: Build accessible, standards-compliant web applications.

Pain Point: Limited accessibility knowledge or time constraints lead to overlooked issues.

How ASTRA Helps: Detects accessibility issues and provides clear recommendations.


**Persona 2: QA Tester / Accessibility Reviewer**

Goal: Verify accessibility compliance before release.

Pain Point: Manual accessibility testing is slow and repetitive.

How ASTRA Helps: Automates accessibility checks and generates structured reports.


**Persona 3: DevOps Engineer**

Goal: Prevent inaccessible code from reaching production.

Pain Point: Accessibility checks are often performed too late in the development lifecycle.

How ASTRA Helps: Integrates accessibility analysis into the CI/CD workflow for early issue detection.


**Persona 4: Developer Using AI-Generated Code**

Goal: Generate frontend code quickly without compromising accessibility.

Pain Point: AI-generated code may miss accessibility semantics such as labels, ARIA attributes, and keyboard support.

How ASTRA Helps: Reviews generated code, identifies accessibility gaps, and provides actionable guidance before deployment.

**4. Vision Statement**

To make web accessibility effortless by integrating AST-level automated inspection and accessibility guidance directly into the developer workflow, this project aims to provide a lightweight, developer-friendly tool that helps teams detect, explain, and improve accessibility issues early so websites become easier to use for everyone, including people who rely on assistive technologies.

**5. Key Features & Goals**

Analysis

•	Perform AST-level inspection of React/JSX source code.

•	Apply rule-based static analysis to detect WCAG-related accessibility issues.

•	Identify problems such as missing alt text, unlabeled form controls, improper heading hierarchy, poor semantic structure, and keyboard accessibility gaps.
Reporting

•	Generate an overall accessibility score.

•	Categorize detected issues based on severity.

•	Present scan results in a structured and easy-to-read report.
Guidance

•	Provide developer-friendly explanations for each detected issue.

•	Recommend best practices and remediation guidance based on WCAG principles.

•	Help developers identify and address accessibility issues early in the development lifecycle.

6. Success Metrics


•	Detect the predefined WCAG rules supported in the first release.

•	Generate accessibility reports in under 2 seconds.

•	Process React/JSX files in under 100 ms per component.

•	Successfully analyze all valid React/JSX files without errors.

•	Support consistent results across repeated scans.

•	Run successfully in a local Docker environment.

**6. Assumptions & Constraints**


•	The first version scans only a single webpage or React component at a time.

•	The project is designed primarily for React (JavaScript/TypeScript JSX) applications.

•	Accessibility analysis is based on static code inspection and supported WCAG rules; 
runtime-generated UI and dynamic state changes are outside the scope of the first version.

•	The application is intended for local development and demonstration using Docker.

•	The first version focuses on detecting and reporting accessibility issues, not automatically fixing them.

•	The project is a lightweight prototype and is not intended to replace comprehensive accessibility testing or manual WCAG audits.

