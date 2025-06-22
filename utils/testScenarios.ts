import { StorageManager } from './storage';
import { BlockLogic } from './blockLogic';
import { SectionGroup } from '../types';

export class TestScenarios {
  static async createTestData(): Promise<void> {
    console.log('Creating test data...');

    // Test Section Group 1: SNS sites during work hours (multiple time blocks for testing)
    const snsGroup: SectionGroup = {
      name: 'SNS',
      urls: [
        'https://twitter.com',
        'https://facebook.com',
        'https://instagram.com'
      ],
      timeBlocks: [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '15:00' },
        { start: '16:00', end: '17:00' }
      ],
      enabled: true
    };

    // Test Section Group 2: Video sites during lunch break (multiple time blocks for deletion testing)
    const videoGroup: SectionGroup = {
      name: '動画サイト',
      urls: [
        'https://www.youtube.com',
        'https://www.netflix.com'
      ],
      timeBlocks: [
        { start: '12:00', end: '13:00' },
        { start: '19:00', end: '21:00' }
      ],
      enabled: false // Disabled for testing
    };

    // Test Section Group 3: Slack workspace
    const slackGroup: SectionGroup = {
      name: 'Slack集中時間',
      urls: [
        'https://app.slack.com'
      ],
      timeBlocks: [
        { start: '14:00', end: '16:00' }
      ],
      enabled: true
    };

    await StorageManager.saveSectionGroup('SNS', snsGroup);
    await StorageManager.saveSectionGroup('動画サイト', videoGroup);
    await StorageManager.saveSectionGroup('Slack集中時間', slackGroup);

    console.log('Test data created successfully');
  }

  static async runBlockLogicTests(): Promise<void> {
    console.log('Running block logic tests...');

    // Test time validation
    console.assert(BlockLogic.isValidTimeFormat('09:00'), 'Valid time format test failed');
    console.assert(!BlockLogic.isValidTimeFormat('25:00'), 'Invalid time format test failed');
    console.assert(!BlockLogic.isValidTimeFormat('abc'), 'Invalid time format test failed');

    // Test URL matching
    console.assert(
      BlockLogic.doesUrlMatch('https://twitter.com/home', 'https://twitter.com'),
      'URL matching test failed'
    );
    console.assert(
      !BlockLogic.doesUrlMatch('https://google.com', 'https://twitter.com'),
      'URL non-matching test failed'
    );

    // Test time range checking
    const testTimeBlock = { start: '09:00', end: '17:00' };
    console.assert(
      BlockLogic.isTimeInBlock('10:00', testTimeBlock),
      'Time in block test failed'
    );
    console.assert(
      !BlockLogic.isTimeInBlock('18:00', testTimeBlock),
      'Time not in block test failed'
    );

    console.log('Block logic tests completed');
  }

  static async runStorageTests(): Promise<void> {
    console.log('Running storage tests...');

    // Test create and retrieve
    const testGroup: SectionGroup = {
      name: 'Test Group',
      urls: ['https://test.com'],
      timeBlocks: [{ start: '09:00', end: '17:00' }],
      enabled: true
    };

    await StorageManager.saveSectionGroup('Test Group', testGroup);
    const retrieved = await StorageManager.getSectionGroup('Test Group');
    console.assert(retrieved !== null, 'Storage retrieval test failed');
    console.assert(retrieved?.name === 'Test Group', 'Storage data integrity test failed');

    // Test URL operations
    await StorageManager.addUrlToGroup('Test Group', 'https://test2.com');
    const updated = await StorageManager.getSectionGroup('Test Group');
    console.assert(updated?.urls.length === 2, 'Add URL test failed');

    await StorageManager.removeUrlFromGroup('Test Group', 'https://test2.com');
    const afterRemove = await StorageManager.getSectionGroup('Test Group');
    console.assert(afterRemove?.urls.length === 1, 'Remove URL test failed');

    // Cleanup
    await StorageManager.deleteSectionGroup('Test Group');

    console.log('Storage tests completed');
  }

  static async runIntegrationTest(): Promise<void> {
    console.log('Running integration test...');

    // Create test data
    await this.createTestData();

    // Get all groups
    const groups = await StorageManager.getAllSectionGroups();
    console.log('Retrieved groups:', Object.keys(groups));

    // Test blocking logic with current state
    const testUrls = [
      'https://twitter.com/home',
      'https://www.youtube.com/watch?v=test',
      'https://app.slack.com/client/test',
      'https://google.com'
    ];

    for (const url of testUrls) {
      const result = BlockLogic.checkIfShouldBlock(url, groups);
      console.log(`URL: ${url}, Should block: ${result.shouldBlock}, Group: ${result.groupName || 'none'}`);
    }

    console.log('Integration test completed');
  }

  static async runAllTests(): Promise<void> {
    console.log('Starting comprehensive test suite...');
    
    try {
      await this.runBlockLogicTests();
      await this.runStorageTests();
      await this.runIntegrationTest();
      console.log('All tests completed successfully');
    } catch (error) {
      console.error('Test suite failed:', error);
    }
  }
}