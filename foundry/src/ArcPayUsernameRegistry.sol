// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Arc Pay Username Registry
/// @notice Maps unique lowercase usernames to wallet addresses.
/// @dev Usernames may contain only lowercase letters a-z and numbers 0-9.
contract ArcPayUsernameRegistry {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error UsernameTaken();
    error UsernameNotFound();
    error InvalidUsername();
    error AlreadyHasUsername();
    error NotUsernameOwner();
    error ZeroAddress();

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event UsernameRegistered(
        string indexed username,
        address indexed owner
    );

    event UsernameChanged(
        string indexed oldUsername,
        string indexed newUsername,
        address indexed owner
    );

    event UsernameReleased(
        string indexed username,
        address indexed owner
    );

    /*//////////////////////////////////////////////////////////////
                              STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice username => wallet address
    mapping(string => address) private _owners;

    /// @notice wallet address => username
    mapping(address => string) private _usernames;

    /*//////////////////////////////////////////////////////////////
                              CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint256 public constant MIN_USERNAME_LENGTH = 3;
    uint256 public constant MAX_USERNAME_LENGTH = 20;

    /*//////////////////////////////////////////////////////////////
                          REGISTRATION
    //////////////////////////////////////////////////////////////*/

    /// @notice Register a new username for the caller.
    /// @param username Lowercase username containing only a-z and 0-9.
    function registerUsername(
        string calldata username
    ) external {
        _validateUsername(username);

        if (_owners[username] != address(0)) {
            revert UsernameTaken();
        }

        if (bytes(_usernames[msg.sender]).length != 0) {
            revert AlreadyHasUsername();
        }

        _owners[username] = msg.sender;
        _usernames[msg.sender] = username;

        emit UsernameRegistered(
            username,
            msg.sender
        );
    }

    /*//////////////////////////////////////////////////////////////
                           CHANGE USERNAME
    //////////////////////////////////////////////////////////////*/

    /// @notice Change the caller's existing username.
    /// @param newUsername New lowercase username.
    function changeUsername(
        string calldata newUsername
    ) external {
        _validateUsername(newUsername);

        string memory oldUsername =
            _usernames[msg.sender];

        if (bytes(oldUsername).length == 0) {
            revert UsernameNotFound();
        }

        if (
            _owners[newUsername] != address(0)
        ) {
            revert UsernameTaken();
        }

        delete _owners[oldUsername];

        _owners[newUsername] = msg.sender;
        _usernames[msg.sender] = newUsername;

        emit UsernameChanged(
            oldUsername,
            newUsername,
            msg.sender
        );
    }

    /*//////////////////////////////////////////////////////////////
                            RELEASE
    //////////////////////////////////////////////////////////////*/

    /// @notice Permanently release the caller's current username.
    function releaseUsername() external {
        string memory username =
            _usernames[msg.sender];

        if (bytes(username).length == 0) {
            revert UsernameNotFound();
        }

        delete _owners[username];
        delete _usernames[msg.sender];

        emit UsernameReleased(
            username,
            msg.sender
        );
    }

    /*//////////////////////////////////////////////////////////////
                              LOOKUPS
    //////////////////////////////////////////////////////////////*/

    /// @notice Resolve a username to its wallet address.
    /// @return owner Wallet address that owns the username.
    function resolve(
        string calldata username
    ) external view returns (address owner) {
        owner = _owners[username];

        if (owner == address(0)) {
            revert UsernameNotFound();
        }
    }

    /// @notice Get the username belonging to a wallet.
    /// @return username The wallet's username.
    function usernameOf(
        address owner
    ) external view returns (
        string memory username
    ) {
        if (owner == address(0)) {
            revert ZeroAddress();
        }

        username = _usernames[owner];

        if (bytes(username).length == 0) {
            revert UsernameNotFound();
        }
    }

    /// @notice Check whether a username is currently registered.
    function isUsernameAvailable(
        string calldata username
    ) external view returns (bool) {
        return _owners[username] == address(0);
    }

    /// @notice Get the wallet that owns a username.
    /// @return owner address(0) if unregistered.
    function ownerOf(
        string calldata username
    ) external view returns (address owner) {
        owner = _owners[username];
    }

    /*//////////////////////////////////////////////////////////////
                         INTERNAL VALIDATION
    //////////////////////////////////////////////////////////////*/

    function _validateUsername(
        string calldata username
    ) internal pure {
        bytes calldata value =
            bytes(username);

        uint256 length = value.length;

        if (
            length <
            MIN_USERNAME_LENGTH ||
            length >
            MAX_USERNAME_LENGTH
        ) {
            revert InvalidUsername();
        }

        for (
            uint256 i = 0;
            i < length;
            i++
        ) {
            bytes1 character =
                value[i];

            bool isLetter =
                character >= 0x61 &&
                character <= 0x7A;

            bool isNumber =
                character >= 0x30 &&
                character <= 0x39;

            if (
                !isLetter &&
                !isNumber
            ) {
                revert InvalidUsername();
            }
        }
    }
}
