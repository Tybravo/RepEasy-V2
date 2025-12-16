#[test_only]
module repeasy::repeasy_verify_tests {
    use repeasy::repeasy_verify::{
        Self,
        DAppRegistry,
        DAppInfo,
        VerificationBadge,
        AdminCap
    };
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock;
    use std::string::{Self, String};

    // Test addresses
    const ADMIN: address = @0xAD;
    const USER1: address = @0xA1;
    const USER2: address = @0xA2;

    // Helper function to create test strings
    fun utf8(bytes: vector<u8>): String {
        string::utf8(bytes)
    }

    // Setup function to initialize the module
    fun setup_test(scenario: &mut Scenario) {
        ts::next_tx(scenario, ADMIN);
        {
            repeasy_verify::init_for_testing(ts::ctx(scenario));
        };
    }

    #[test]
    fun test_init_module() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // Check that registry was created and shared
        ts::next_tx(&mut scenario, ADMIN);
        {
            assert!(ts::has_most_recent_shared<DAppRegistry>(), 0);
            
            let registry = ts::take_shared<DAppRegistry>(&scenario);
            assert!(repeasy_verify::get_total_verified(&registry) == 0, 1);
            ts::return_shared(registry);
        };

        // Check that admin cap was transferred to admin
        ts::next_tx(&mut scenario, ADMIN);
        {
            assert!(ts::has_most_recent_for_address<AdminCap>(ADMIN), 2);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_verify_dapp_success() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // Create clock
        ts::next_tx(&mut scenario, ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // Verify a dApp
        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<DAppRegistry>(&scenario);
            
            repeasy_verify::verify_dapp(
                &mut registry,
                utf8(b"MyDApp"),
                utf8(b"https://mydapp.com"),
                utf8(b"@mydapp"),
                utf8(b"banner_blob_123"),
                utf8(b"icon_blob_456"),
                utf8(b"desc_blob_789"),
                &clock,
                ts::ctx(&mut scenario)
            );

            assert!(repeasy_verify::get_total_verified(&registry) == 1, 0);
            assert!(repeasy_verify::is_dapp_verified(&registry, utf8(b"MyDApp")), 1);
            assert!(repeasy_verify::is_domain_registered(&registry, utf8(b"https://mydapp.com")), 2);

            ts::return_shared(registry);
        };

        // Check that badge was transferred to USER1
        ts::next_tx(&mut scenario, USER1);
        {
            assert!(ts::has_most_recent_for_address<VerificationBadge>(USER1), 3);
            let badge = ts::take_from_address<VerificationBadge>(&scenario, USER1);
            
            assert!(repeasy_verify::get_badge_dapp_name(&badge) == utf8(b"MyDApp"), 4);
            assert!(repeasy_verify::get_badge_domain_url(&badge) == utf8(b"https://mydapp.com"), 5);
            assert!(repeasy_verify::get_badge_owner(&badge) == USER1, 6);
            assert!(repeasy_verify::get_badge_number(&badge) == 1, 7);

            ts::return_to_address(USER1, badge);
        };

        // Check that DAppInfo was shared
        ts::next_tx(&mut scenario, USER1);
        {
            let dapp_info = ts::take_shared<DAppInfo>(&scenario);
            
            assert!(repeasy_verify::get_dapp_name(&dapp_info) == utf8(b"MyDApp"), 8);
            assert!(repeasy_verify::get_domain_url(&dapp_info) == utf8(b"https://mydapp.com"), 9);
            assert!(repeasy_verify::get_twitter_username(&dapp_info) == utf8(b"@mydapp"), 10);
            assert!(repeasy_verify::get_banner_blob_id(&dapp_info) == utf8(b"banner_blob_123"), 11);
            assert!(repeasy_verify::get_icon_blob_id(&dapp_info) == utf8(b"icon_blob_456"), 12);
            assert!(repeasy_verify::get_description_blob_id(&dapp_info) == utf8(b"desc_blob_789"), 13);
            assert!(repeasy_verify::get_owner(&dapp_info) == USER1, 14);

            ts::return_shared(dapp_info);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_verify_multiple_dapps() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // USER1 verifies first dApp
        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<DAppRegistry>(&scenario);
            
            repeasy_verify::verify_dapp(
                &mut registry,
                utf8(b"DApp1"),
                utf8(b"https://dapp1.com"),
                utf8(b"@dapp1"),
                utf8(b"banner1"),
                utf8(b"icon1"),
                utf8(b"desc1"),
                &clock,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(registry);
        };

        // USER2 verifies second dApp
        ts::next_tx(&mut scenario, USER2);
        {
            let mut registry = ts::take_shared<DAppRegistry>(&scenario);
            
            repeasy_verify::verify_dapp(
                &mut registry,
                utf8(b"DApp2"),
                utf8(b"https://dapp2.com"),
                utf8(b"@dapp2"),
                utf8(b"banner2"),
                utf8(b"icon2"),
                utf8(b"desc2"),
                &clock,
                ts::ctx(&mut scenario)
            );

            assert!(repeasy_verify::get_total_verified(&registry) == 2, 0);

            ts::return_shared(registry);
        };

        // Verify both badges were minted with correct numbers
        ts::next_tx(&mut scenario, USER1);
        {
            let badge1 = ts::take_from_address<VerificationBadge>(&scenario, USER1);
            assert!(repeasy_verify::get_badge_number(&badge1) == 1, 1);
            ts::return_to_address(USER1, badge1);
        };

        ts::next_tx(&mut scenario, USER2);
        {
            let badge2 = ts::take_from_address<VerificationBadge>(&scenario, USER2);
            assert!(repeasy_verify::get_badge_number(&badge2) == 2, 2);
            ts::return_to_address(USER2, badge2);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = repeasy::repeasy_verify::E_DAPP_ALREADY_VERIFIED)]
    fun test_verify_duplicate_dapp_name_fails() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // First verification
        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<DAppRegistry>(&scenario);
            
            repeasy_verify::verify_dapp(
                &mut registry,
                utf8(b"MyDApp"),
                utf8(b"https://mydapp.com"),
                utf8(b"@mydapp"),
                utf8(b"banner1"),
                utf8(b"icon1"),
                utf8(b"desc1"),
                &clock,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(registry);
        };

        // Try to verify with same name (should fail)
        ts::next_tx(&mut scenario, USER2);
        {
            let mut registry = ts::take_shared<DAppRegistry>(&scenario);
            
            repeasy_verify::verify_dapp(
                &mut registry,
                utf8(b"MyDApp"), // Same name
                utf8(b"https://different.com"), // Different domain
                utf8(b"@different"),
                utf8(b"banner2"),
                utf8(b"icon2"),
                utf8(b"desc2"),
                &clock,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(registry);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = repeasy::repeasy_verify::E_DOMAIN_ALREADY_REGISTERED)]
    fun test_verify_duplicate_domain_fails() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // First verification
        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<DAppRegistry>(&scenario);
            
            repeasy_verify::verify_dapp(
                &mut registry,
                utf8(b"MyDApp"),
                utf8(b"https://mydapp.com"),
                utf8(b"@mydapp"),
                utf8(b"banner1"),
                utf8(b"icon1"),
                utf8(b"desc1"),
                &clock,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(registry);
        };

        // Try to verify with same domain (should fail)
        ts::next_tx(&mut scenario, USER2);
        {
            let mut registry = ts::take_shared<DAppRegistry>(&scenario);
            
            repeasy_verify::verify_dapp(
                &mut registry,
                utf8(b"DifferentDApp"), // Different name
                utf8(b"https://mydapp.com"), // Same domain
                utf8(b"@different"),
                utf8(b"banner2"),
                utf8(b"icon2"),
                utf8(b"desc2"),
                &clock,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(registry);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = repeasy::repeasy_verify::E_INVALID_BLOB_ID)]
    fun test_verify_empty_blob_id_fails() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<DAppRegistry>(&scenario);
            
            repeasy_verify::verify_dapp(
                &mut registry,
                utf8(b"MyDApp"),
                utf8(b"https://mydapp.com"),
                utf8(b"@mydapp"),
                utf8(b""), // Empty banner blob ID
                utf8(b"icon1"),
                utf8(b"desc1"),
                &clock,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(registry);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_update_dapp_info_success() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // Verify a dApp
        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<DAppRegistry>(&scenario);
            
            repeasy_verify::verify_dapp(
                &mut registry,
                utf8(b"MyDApp"),
                utf8(b"https://mydapp.com"),
                utf8(b"@mydapp"),
                utf8(b"banner1"),
                utf8(b"icon1"),
                utf8(b"desc1"),
                &clock,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(registry);
        };

        // Update the dApp info
        ts::next_tx(&mut scenario, USER1);
        {
            let mut dapp_info = ts::take_shared<DAppInfo>(&scenario);
            
            repeasy_verify::update_dapp_info(
                &mut dapp_info,
                utf8(b"@updated_twitter"),
                utf8(b"new_banner"),
                utf8(b"new_icon"),
                utf8(b"new_desc"),
                &clock,
                ts::ctx(&mut scenario)
            );

            assert!(repeasy_verify::get_twitter_username(&dapp_info) == utf8(b"@updated_twitter"), 0);
            assert!(repeasy_verify::get_banner_blob_id(&dapp_info) == utf8(b"new_banner"), 1);
            assert!(repeasy_verify::get_icon_blob_id(&dapp_info) == utf8(b"new_icon"), 2);
            assert!(repeasy_verify::get_description_blob_id(&dapp_info) == utf8(b"new_desc"), 3);

            ts::return_shared(dapp_info);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = repeasy::repeasy_verify::E_UNAUTHORIZED)]
    fun test_update_dapp_info_unauthorized_fails() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // USER1 verifies a dApp
        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<DAppRegistry>(&scenario);
            
            repeasy_verify::verify_dapp(
                &mut registry,
                utf8(b"MyDApp"),
                utf8(b"https://mydapp.com"),
                utf8(b"@mydapp"),
                utf8(b"banner1"),
                utf8(b"icon1"),
                utf8(b"desc1"),
                &clock,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(registry);
        };

        // USER2 tries to update (should fail)
        ts::next_tx(&mut scenario, USER2);
        {
            let mut dapp_info = ts::take_shared<DAppInfo>(&scenario);
            
            repeasy_verify::update_dapp_info(
                &mut dapp_info,
                utf8(b"@hacked"),
                utf8(b"hacked_banner"),
                utf8(b"hacked_icon"),
                utf8(b"hacked_desc"),
                &clock,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(dapp_info);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = repeasy::repeasy_verify::E_INVALID_BLOB_ID)]
    fun test_update_empty_blob_id_fails() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // Verify a dApp
        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<DAppRegistry>(&scenario);
            
            repeasy_verify::verify_dapp(
                &mut registry,
                utf8(b"MyDApp"),
                utf8(b"https://mydapp.com"),
                utf8(b"@mydapp"),
                utf8(b"banner1"),
                utf8(b"icon1"),
                utf8(b"desc1"),
                &clock,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(registry);
        };

        // Try to update with empty blob ID
        ts::next_tx(&mut scenario, USER1);
        {
            let mut dapp_info = ts::take_shared<DAppInfo>(&scenario);
            
            repeasy_verify::update_dapp_info(
                &mut dapp_info,
                utf8(b"@twitter"),
                utf8(b""), // Empty banner
                utf8(b"icon"),
                utf8(b"desc"),
                &clock,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(dapp_info);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_view_functions() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        // Verify a dApp
        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<DAppRegistry>(&scenario);
            
            repeasy_verify::verify_dapp(
                &mut registry,
                utf8(b"MyDApp"),
                utf8(b"https://mydapp.com"),
                utf8(b"@mydapp"),
                utf8(b"banner1"),
                utf8(b"icon1"),
                utf8(b"desc1"),
                &clock,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(registry);
        };

        // Test view functions
        ts::next_tx(&mut scenario, ADMIN);
        {
            let registry = ts::take_shared<DAppRegistry>(&scenario);
            
            // Test is_dapp_verified
            assert!(repeasy_verify::is_dapp_verified(&registry, utf8(b"MyDApp")), 0);
            assert!(!repeasy_verify::is_dapp_verified(&registry, utf8(b"NonExistent")), 1);
            
            // Test is_domain_registered
            assert!(repeasy_verify::is_domain_registered(&registry, utf8(b"https://mydapp.com")), 2);
            assert!(!repeasy_verify::is_domain_registered(&registry, utf8(b"https://other.com")), 3);
            
            // Test get_total_verified
            assert!(repeasy_verify::get_total_verified(&registry) == 1, 4);
            
            // Test get_dapp_id_by_name and get_dapp_id_by_domain
            let id_by_name = repeasy_verify::get_dapp_id_by_name(&registry, utf8(b"MyDApp"));
            let id_by_domain = repeasy_verify::get_dapp_id_by_domain(&registry, utf8(b"https://mydapp.com"));
            assert!(id_by_name == id_by_domain, 5);

            ts::return_shared(registry);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = repeasy::repeasy_verify::E_DAPP_NOT_FOUND)]
    fun test_get_dapp_id_not_found_fails() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let registry = ts::take_shared<DAppRegistry>(&scenario);
            
            // Try to get ID of non-existent dApp
            let _id = repeasy_verify::get_dapp_id_by_name(&registry, utf8(b"NonExistent"));

            ts::return_shared(registry);
        };

        ts::end(scenario);
    }
}
