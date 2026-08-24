// End-to-End (E2E) Testing Setup
const { test, expect } = require('@playwright/test');

// Test suite for the Job Aggregator Platform

test.describe('Job Aggregator Platform E2E Tests', () => {
  // Test for user registration and login
  test('User registration and login flow', async ({ page }) => {
    // Navigate to the registration page
    await page.goto('http://localhost:3001/inscription');
    
    // Fill out the registration form
    await page.fill('input[name="name"]', 'TestUser');
    await page.fill('input[name="firstname"]', 'Test');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.selectOption('select[name="role"]', 'user');
    
    // Submit the registration form
    await page.click('button[type="submit"]');
    
    // Verify successful registration
    await expect(page).toHaveURL('http://localhost:3001/connexion');
    
    // Fill out the login form
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'testpassword123');
    
    // Submit the login form
    await page.click('button[type="submit"]');
    
    // Verify successful login
    await expect(page).toHaveURL('http://localhost:3001/');
  });

  // Test for job search functionality
  test('Job search functionality', async ({ page }) => {
    // Navigate to the home page
    await page.goto('http://localhost:3001/');
    
    // Fill out the search bar
    await page.fill('input[placeholder="Rechercher un emploi"]', 'Développeur');
    
    // Submit the search
    await page.click('button[type="submit"]');
    
    // Verify search results are displayed
    await expect(page.locator('.job-card')).toHaveCountGreaterThan(0);
  });

  // Test for job application
  test('Job application flow', async ({ page }) => {
    // Navigate to the home page
    await page.goto('http://localhost:3001/');
    
    // Click on the first job card
    await page.click('.job-card:first-child');
    
    // Verify job details are displayed
    await expect(page).toHaveURL(/.*\/offres\/.*/);
    
    // Click on the apply button
    await page.click('button:has-text("Postuler")');
    
    // Fill out the application form
    await page.fill('input[name="firstname"]', 'Test');
    await page.fill('input[name="name"]', 'User');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    
    // Submit the application
    await page.click('button[type="submit"]');
    
    // Verify successful application
    await expect(page).toHaveText('Votre candidature a été envoyée avec succès');
  });

  // Test for admin job posting
  test('Admin job posting flow', async ({ page }) => {
    // Navigate to the admin login page
    await page.goto('http://localhost:3001/admin/connexion');
    
    // Fill out the admin login form
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'adminpassword123');
    
    // Submit the login form
    await page.click('button[type="submit"]');
    
    // Verify successful admin login
    await expect(page).toHaveURL('http://localhost:3001/admin');
    
    // Navigate to the job posting page
    await page.goto('http://localhost:3001/admin/offres/ajouter');
    
    // Fill out the job posting form
    await page.fill('input[name="title"]', 'Test Job Title');
    await page.fill('input[name="company"]', 'Test Company');
    await page.fill('textarea[name="description"]', 'This is a test job description.');
    
    // Submit the job posting form
    await page.click('button[type="submit"]');
    
    // Verify successful job posting
    await expect(page).toHaveText('Offre publiée avec succès');
  });
});