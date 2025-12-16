module repeasy::repeasy_verify {
    use std::string::String;
    use sui::table::Table;
    use sui::clock::Clock;

    // =================== Error Codes ===================
    const E_DAPP_ALREADY_VERIFIED: u64 = 1;
    const E_DOMAIN_ALREADY_REGISTERED: u64 = 2;
    const E_UNAUTHORIZED: u64 = 3;
    const E_INVALID_BLOB_ID: u64 = 4;
    const E_DAPP_NOT_FOUND: u64 = 5;

    // =================== Structs ===================
    
    /// One-time witness for the module
    public struct REPEASY_VERIFY has drop {}

    /// Main registry that stores all verified dApps
    public struct DAppRegistry has key {
        id: UID,
        // Maps dApp name to DAppInfo ID
        dapps: Table<String, ID>,
        // Maps domain URL to DAppInfo ID (prevents duplicate domains)
        domains: Table<String, ID>,
        // Counter for total verified dApps
        total_verified: u64,
    }

    /// Stores dApp verification information
    public struct DAppInfo has key, store {
        id: UID,
        name: String,
        domain_url: String,
        twitter_username: String,
        banner_blob_id: String,
        icon_blob_id: String,
        description_blob_id: String,
        owner: address,
        verified_at: u64,
        verification_badge_id: ID,
    }

    /// NFT Badge minted upon successful verification
    public struct VerificationBadge has key, store {
        id: UID,
        dapp_name: String,
        domain_url: String,
        owner: address,
        verified_at: u64,
        badge_number: u64,
        // Walrus storage references
        banner_blob_id: String,
        icon_blob_id: String,
    }

    /// Admin capability for registry management
    public struct AdminCap has key, store {
        id: UID,
    }

    // =================== Events ===================
    
    public struct DAppVerified has copy, drop {
        dapp_info_id: ID,
        badge_id: ID,
        name: String,
        domain_url: String,
        owner: address,
        verified_at: u64,
    }

    public struct DAppUpdated has copy, drop {
        dapp_info_id: ID,
        name: String,
        updated_by: address,
        updated_at: u64,
    }

    // =================== Init Function ===================
    
    fun init(_otw: REPEASY_VERIFY, ctx: &mut TxContext) {
        use sui::table;
        use sui::package;
        use sui::display;
        
        // Create and share the registry
        let registry = DAppRegistry {
            id: object::new(ctx),
            dapps: table::new(ctx),
            domains: table::new(ctx),
            total_verified: 0,
        };
        transfer::share_object(registry);

        // Create admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, ctx.sender());

        // Setup Display for VerificationBadge
        let publisher = package::claim(_otw, ctx);
        let mut display = display::new<VerificationBadge>(&publisher, ctx);
        
        display.add(b"name".to_string(), b"Repeasy Verification Badge - {dapp_name}".to_string());
        display.add(b"description".to_string(), b"Official verification badge for {dapp_name} on Repeasy platform".to_string());
        display.add(b"image_url".to_string(), b"https://aggregator.walrus-testnet.walrus.space/v1/{icon_blob_id}".to_string());
        display.add(b"project_url".to_string(), b"{domain_url}".to_string());
        display.add(b"badge_number".to_string(), b"#{badge_number}".to_string());
        
        display.update_version();
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // =================== Public Entry Functions ===================
    
    /// Register and verify a dApp with Walrus storage proofs
    public entry fun verify_dapp(
        registry: &mut DAppRegistry,
        name: String,
        domain_url: String,
        twitter_username: String,
        banner_blob_id: String,
        icon_blob_id: String,
        description_blob_id: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Check if dApp name already exists
        assert!(!registry.dapps.contains(name), E_DAPP_ALREADY_VERIFIED);
        
        // Check if domain already registered
        assert!(!registry.domains.contains(domain_url), E_DOMAIN_ALREADY_REGISTERED);
        
        // Validate blob IDs (basic validation - checking non-empty)
        assert!(banner_blob_id.length() > 0, E_INVALID_BLOB_ID);
        assert!(icon_blob_id.length() > 0, E_INVALID_BLOB_ID);
        assert!(description_blob_id.length() > 0, E_INVALID_BLOB_ID);

        let owner = ctx.sender();
        let verified_at = clock.timestamp_ms();
        
        // Increment total verified count
        registry.total_verified = registry.total_verified + 1;
        let badge_number = registry.total_verified;

        // Create verification badge NFT
        let badge = VerificationBadge {
            id: object::new(ctx),
            dapp_name: name,
            domain_url,
            owner,
            verified_at,
            badge_number,
            banner_blob_id,
            icon_blob_id,
        };
        
        let badge_id = object::id(&badge);

        // Create dApp info
        let dapp_info = DAppInfo {
            id: object::new(ctx),
            name,
            domain_url,
            twitter_username,
            banner_blob_id,
            icon_blob_id,
            description_blob_id,
            owner,
            verified_at,
            verification_badge_id: badge_id,
        };

        let dapp_info_id = object::id(&dapp_info);

        // Add to registry
        registry.dapps.add(name, dapp_info_id);
        registry.domains.add(domain_url, dapp_info_id);

        // Emit event
        sui::event::emit(DAppVerified {
            dapp_info_id,
            badge_id,
            name,
            domain_url,
            owner,
            verified_at,
        });

        // Transfer badge to owner
        transfer::transfer(badge, owner);
        
        // Share dApp info object
        transfer::share_object(dapp_info);
    }

    /// Update dApp information (only owner can update)
    public entry fun update_dapp_info(
        dapp_info: &mut DAppInfo,
        twitter_username: String,
        banner_blob_id: String,
        icon_blob_id: String,
        description_blob_id: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        assert!(dapp_info.owner == sender, E_UNAUTHORIZED);

        // Validate new blob IDs
        assert!(banner_blob_id.length() > 0, E_INVALID_BLOB_ID);
        assert!(icon_blob_id.length() > 0, E_INVALID_BLOB_ID);
        assert!(description_blob_id.length() > 0, E_INVALID_BLOB_ID);

        let _updated_at = clock.timestamp_ms();

        // Update information
        dapp_info.twitter_username = twitter_username;
        dapp_info.banner_blob_id = banner_blob_id;
        dapp_info.icon_blob_id = icon_blob_id;
        dapp_info.description_blob_id = description_blob_id;

        // Emit update event
        sui::event::emit(DAppUpdated {
            dapp_info_id: object::id(dapp_info),
            name: dapp_info.name,
            updated_by: sender,
            updated_at: _updated_at,
        });
    }

    // =================== View Functions ===================
    
    /// Check if a dApp name is already verified
    public fun is_dapp_verified(registry: &DAppRegistry, name: String): bool {
        registry.dapps.contains(name)
    }

    /// Check if a domain is already registered
    public fun is_domain_registered(registry: &DAppRegistry, domain_url: String): bool {
        registry.domains.contains(domain_url)
    }

    /// Get total verified dApps count
    public fun get_total_verified(registry: &DAppRegistry): u64 {
        registry.total_verified
    }

    /// Get dApp info ID by name
    public fun get_dapp_id_by_name(registry: &DAppRegistry, name: String): ID {
        assert!(registry.dapps.contains(name), E_DAPP_NOT_FOUND);
        *registry.dapps.borrow(name)
    }

    /// Get dApp info ID by domain
    public fun get_dapp_id_by_domain(registry: &DAppRegistry, domain_url: String): ID {
        assert!(registry.domains.contains(domain_url), E_DAPP_NOT_FOUND);
        *registry.domains.borrow(domain_url)
    }

    // =================== Accessor Functions for DAppInfo ===================
    
    public fun get_dapp_name(dapp_info: &DAppInfo): String {
        dapp_info.name
    }

    public fun get_domain_url(dapp_info: &DAppInfo): String {
        dapp_info.domain_url
    }

    public fun get_twitter_username(dapp_info: &DAppInfo): String {
        dapp_info.twitter_username
    }

    public fun get_banner_blob_id(dapp_info: &DAppInfo): String {
        dapp_info.banner_blob_id
    }

    public fun get_icon_blob_id(dapp_info: &DAppInfo): String {
        dapp_info.icon_blob_id
    }

    public fun get_description_blob_id(dapp_info: &DAppInfo): String {
        dapp_info.description_blob_id
    }

    public fun get_owner(dapp_info: &DAppInfo): address {
        dapp_info.owner
    }

    public fun get_verified_at(dapp_info: &DAppInfo): u64 {
        dapp_info.verified_at
    }

    // =================== Accessor Functions for VerificationBadge ===================
    
    public fun get_badge_dapp_name(badge: &VerificationBadge): String {
        badge.dapp_name
    }

    public fun get_badge_domain_url(badge: &VerificationBadge): String {
        badge.domain_url
    }

    public fun get_badge_owner(badge: &VerificationBadge): address {
        badge.owner
    }

    public fun get_badge_number(badge: &VerificationBadge): u64 {
        badge.badge_number
    }

    public fun get_badge_verified_at(badge: &VerificationBadge): u64 {
        badge.verified_at
    }

    // =================== Test Functions ===================
    
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(REPEASY_VERIFY {}, ctx);
    }
}
