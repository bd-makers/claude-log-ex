class Clogex < Formula
  desc "TUI for exploring Claude Code session logs"
  homepage "https://github.com/bd-makers/claude-log-ex"
  version "0.1.0"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/bd-makers/claude-log-ex/releases/download/v#{version}/clogex-macos-arm64"
      sha256 "a74d4863a98485fd7793e43cbede3f3defd0489e30512027f43bcc29fa647fde"
    end
  end

  def install
    bin.install "clogex-macos-arm64" => "clogex"
  end

  test do
    assert_match "Usage", shell_output("#{bin}/clogex --help 2>&1", 1)
  end
end
